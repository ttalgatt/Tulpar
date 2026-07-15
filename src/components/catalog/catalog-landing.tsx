import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/listings/listing-card';
import { PawPrint } from 'lucide-react';
import { listingSlug } from '@/lib/utils';
import {
	catalogPath,
	catalogPathFromResolve,
	type CatalogCategory,
	type CatalogResolve,
} from '@/lib/seo/catalog';
import type { ListingListItem } from '@/lib/listings/queries';

type LocaleKey = 'name_ru' | 'name_kk';

interface Props {
	locale: string;
	resolved: CatalogResolve;
	items: ListingListItem[];
	total: number;
	page: number;
	totalPages: number;
	siblings: CatalogCategory[];
}

export async function CatalogLanding({
	locale,
	resolved,
	items,
	total,
	page,
	totalPages,
	siblings,
}: Props) {
	const t = await getTranslations('catalog');
	const localeKey: LocaleKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const categoryName = resolved.category[localeKey];
	const locationName =
		resolved.level === 'city'
			? resolved.city[localeKey]
			: resolved.level === 'region'
				? resolved.region[localeKey]
				: null;

	const h1 = locationName
		? t('h1Location', { category: categoryName, location: locationName })
		: t('h1Category', { category: categoryName });
	const intro = locationName
		? t('introLocation', { category: categoryName, location: locationName })
		: t('introCategory', { category: categoryName });

	const basePath = catalogPathFromResolve(resolved);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';
	const pageUrl = `${siteUrl}${locale === 'kk' ? '/kk' : ''}${basePath}`;

	const breadcrumbItems: { name: string; path: string }[] = [
		{ name: t('breadcrumbRoot'), path: '/listings' },
	];
	if (resolved.level === 'region' || resolved.level === 'city') {
		breadcrumbItems.push({
			name: resolved.region[localeKey],
			path: catalogPath({
				categorySlug: resolved.category.slug,
				regionSlug: resolved.region.slug,
			}),
		});
	}
	if (resolved.level === 'city') {
		breadcrumbItems.push({
			name: resolved.city[localeKey],
			path: catalogPath({
				categorySlug: resolved.category.slug,
				regionSlug: resolved.region.slug,
				citySlug: resolved.city.slug,
			}),
		});
	}
	breadcrumbItems.push({ name: categoryName, path: basePath });

	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((b, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: b.name,
				item: `${siteUrl}${locale === 'kk' ? '/kk' : ''}${b.path}`,
			})),
		},
		{
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: h1,
			description: intro,
			url: pageUrl,
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: total,
				itemListElement: items.slice(0, 24).map((l, i) => {
					const regionName = Array.isArray(l.regions)
						? (l.regions[0]?.name_ru ?? null)
						: (l.regions?.name_ru ?? null);
					const seoSlug = listingSlug(l.title, regionName, l.slug ?? l.id);
					return {
						'@type': 'ListItem',
						position: i + 1,
						url: `${siteUrl}${locale === 'kk' ? '/kk' : ''}/listings/${seoSlug}`,
						name: l.title,
					};
				}),
			},
		},
	];

	const siblingBase =
		resolved.level === 'city'
			? { regionSlug: resolved.region.slug, citySlug: resolved.city.slug }
			: resolved.level === 'region'
				? { regionSlug: resolved.region.slug }
				: {};

	return (
		<div className="container py-6">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<nav className="mb-4 text-sm text-muted-foreground">
				{breadcrumbItems.map((b, i) => (
					<span key={b.path + i}>
						{i > 0 && <span className="mx-2">/</span>}
						{i === breadcrumbItems.length - 1 ? (
							<span className="text-foreground">{b.name}</span>
						) : (
							<Link href={b.path} className="hover:underline">
								{b.name}
							</Link>
						)}
					</span>
				))}
			</nav>

			<h1 className="mb-2 text-2xl font-bold">{h1}</h1>
			<p className="mb-6 max-w-3xl text-sm text-muted-foreground">{intro}</p>

			<div className="mb-4 text-sm text-muted-foreground">
				{t('listingsCount', { count: total })}
			</div>

			{items.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center text-muted-foreground">
						<PawPrint className="mx-auto mb-2 h-10 w-10 opacity-50" />
						<p>{t('empty')}</p>
						<p className="mt-1 text-xs">{t('emptyHint')}</p>
						<div className="mt-4 flex flex-wrap justify-center gap-2">
							{resolved.level !== 'category' && (
								<Button asChild variant="outline" size="sm">
									<Link href={catalogPath({ categorySlug: resolved.category.slug })}>
										{t('viewCategoryNationwide')}
									</Link>
								</Button>
							)}
							{resolved.level === 'city' && (
								<Button asChild variant="outline" size="sm">
									<Link
										href={catalogPath({
											categorySlug: resolved.category.slug,
											regionSlug: resolved.region.slug,
										})}
									>
										{t('viewRegion')}
									</Link>
								</Button>
							)}
							<Button asChild variant="outline" size="sm">
								<Link href="/listings">{t('browseAll')}</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
						{items.map((l) => (
							<ListingCard key={l.id} listing={l} locale={locale} />
						))}
					</div>
					{totalPages > 1 && (
						<nav className="mt-8 flex flex-wrap justify-center gap-2">
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
								.map((p, i, arr) => {
									const prev = arr[i - 1];
									const gap = prev !== undefined && p - prev > 1;
									const href =
										p === 1 ? basePath : `${basePath}?page=${p}`;
									return (
										<span key={p} className="flex items-center gap-2">
											{gap && <span className="text-muted-foreground">…</span>}
											<Button
												asChild={p !== page}
												variant={p === page ? 'default' : 'outline'}
												size="sm"
											>
												{p === page ? (
													<span>{p}</span>
												) : (
													<Link href={href}>{p}</Link>
												)}
											</Button>
										</span>
									);
								})}
						</nav>
					)}
				</>
			)}

			{siblings.length > 0 && (
				<section className="mt-10 border-t pt-8">
					<h2 className="mb-4 text-lg font-semibold">{t('relatedCategories')}</h2>
					<ul className="flex flex-wrap gap-2">
						{siblings.map((cat) => (
							<li key={cat.id}>
								<Link
									href={catalogPath({
										categorySlug: cat.slug,
										...siblingBase,
									})}
									className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
								>
									{cat[localeKey]}
								</Link>
							</li>
						))}
					</ul>
					{resolved.level === 'city' && (
						<p className="mt-4">
							<Link
								href={catalogPath({
									categorySlug: resolved.category.slug,
									regionSlug: resolved.region.slug,
								})}
								className="text-sm text-primary hover:underline"
							>
								{t('viewRegion')}
							</Link>
						</p>
					)}
					{resolved.level !== 'category' && (
						<p className="mt-2">
							<Link
								href={catalogPath({ categorySlug: resolved.category.slug })}
								className="text-sm text-primary hover:underline"
							>
								{t('viewCategoryNationwide')}
							</Link>
						</p>
					)}
				</section>
			)}
		</div>
	);
}
