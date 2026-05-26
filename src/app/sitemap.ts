import type { MetadataRoute } from 'next';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { locales } from '@/i18n/routing';

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
	if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
		try {
			const supabase = createServiceRoleClient();
			const { data } = await supabase
				.from('listings')
				.select('id, updated_at')
				.eq('status', 'published')
				.order('updated_at', { ascending: false })
				.limit(5000);
			dynamic = (data ?? []).flatMap((l) =>
				locales.map((locale) => ({
					url:
						locale === 'ru'
							? `${base}/listings/${l.id}`
							: `${base}/${locale}/listings/${l.id}`,
					lastModified: new Date(l.updated_at),
					changeFrequency: 'weekly' as const,
					priority: 0.6,
				})),
			);
		} catch {
			// fail-safe — пустой динамический sitemap
		}
	}

	return [...staticEntries, ...dynamic];
}
