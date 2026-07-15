import type { MetadataRoute } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { locales } from '@/i18n/routing';
import { listingSlug } from '@/lib/utils';
import { fetchCatalogSitemapEntries, localeCatalogUrl } from '@/lib/seo/catalog';

const STATIC_PATHS = ['', '/listings', '/events'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

	const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
		locales.map((locale) => ({
			url: locale === 'ru' ? `${base}${path || '/'}` : `${base}/${locale}${path || ''}`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: path === '' ? 1 : 0.7,
		})),
	);

	let dynamic: MetadataRoute.Sitemap = [];
	let catalog: MetadataRoute.Sitemap = [];

	if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
		try {
			const supabase = createServiceRoleClient();
			const { data } = await supabase
				.from('listings')
				.select('id, slug, title, updated_at, regions(name_ru)')
				.eq('status', 'published')
				.order('updated_at', { ascending: false })
				.limit(5000);
			dynamic = (data ?? []).flatMap((l) => {
				const region = Array.isArray(l.regions) ? l.regions[0] : l.regions;
				const slug = listingSlug(l.title, region?.name_ru ?? null, l.slug ?? l.id);
				return locales.map((locale) => ({
					url:
						locale === 'ru'
							? `${base}/listings/${slug}`
							: `${base}/${locale}/listings/${slug}`,
					lastModified: new Date(l.updated_at),
					changeFrequency: 'weekly' as const,
					priority: 0.6,
				}));
			});
		} catch {
			// fail-safe — пустой динамический sitemap
		}

		try {
			const catalogEntries = await fetchCatalogSitemapEntries();
			catalog = catalogEntries.flatMap((entry) =>
				locales.map((locale) => ({
					url: localeCatalogUrl(locale, entry.path),
					lastModified: entry.lastModified ?? new Date(),
					changeFrequency: 'daily' as const,
					priority: entry.path.split('/').length <= 3 ? 0.8 : 0.7,
				})),
			);
		} catch {
			// fail-safe — без catalog URL
		}
	}

	return [...staticEntries, ...catalog, ...dynamic];
}
