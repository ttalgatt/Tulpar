import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CatalogLanding } from '@/components/catalog/catalog-landing';
import { fetchListings } from '@/lib/listings/queries';
import {
	catalogFiltersFromResolve,
	catalogPathFromResolve,
	fetchSiblingCategories,
	localeCatalogUrl,
	resolveCatalogSegments,
} from '@/lib/seo/catalog';

export const revalidate = 60;

type PageProps = {
	params: Promise<{ locale: string; slug?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value[0];
	return value;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const segments = slug ?? [];
	const resolved = await resolveCatalogSegments(segments);
	if (!resolved) return { title: '404' };

	const sp = await searchParams;
	const page = Number(pick(sp.page) ?? '1') || 1;
	const filters = catalogFiltersFromResolve(resolved);
	const { total } = await fetchListings({
		...filters,
		sort: 'newest',
		page: 1,
		pageSize: 1,
	});

	const t = await getTranslations({ locale, namespace: 'catalog' });
	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const categoryName = resolved.category[localeKey];
	const locationName =
		resolved.level === 'city'
			? resolved.city[localeKey]
			: resolved.level === 'region'
				? resolved.region[localeKey]
				: null;

	const title = locationName
		? t('metaTitleLocation', { category: categoryName, location: locationName })
		: t('metaTitleCategory', { category: categoryName });
	const description = locationName
		? t('metaDescriptionLocation', { category: categoryName, location: locationName })
		: t('metaDescriptionCategory', { category: categoryName });

	const path = catalogPathFromResolve(resolved);
	const canonical = localeCatalogUrl(locale, path);

	return {
		title,
		description,
		alternates: { canonical },
		robots: total === 0 || page > 1 ? { index: false, follow: true } : { index: true, follow: true },
		openGraph: {
			title,
			description,
			type: 'website',
			url: canonical,
			siteName: 'Бұзау.kz',
			locale: locale === 'kk' ? 'kk_KZ' : 'ru_KZ',
		},
	};
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const segments = slug ?? [];
	if (segments.length < 1 || segments.length > 3) notFound();

	const resolved = await resolveCatalogSegments(segments);
	if (!resolved) notFound();

	const sp = await searchParams;
	const page = Math.max(1, Number(pick(sp.page) ?? '1') || 1);
	const filters = catalogFiltersFromResolve(resolved);

	const [{ items, total, totalPages }, siblings] = await Promise.all([
		fetchListings({
			...filters,
			sort: 'newest',
			page,
			pageSize: 24,
		}),
		fetchSiblingCategories(resolved.category.id),
	]);

	return (
		<CatalogLanding
			locale={locale}
			resolved={resolved}
			items={items}
			total={total}
			page={page}
			totalPages={totalPages}
			siblings={siblings}
		/>
	);
}
