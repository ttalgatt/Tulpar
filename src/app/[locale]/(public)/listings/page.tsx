import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/listings/listing-card';
import { ListingFilters } from '@/components/listings/listing-filters';
import { fetchListings, fetchCategories, fetchRegions } from '@/lib/listings/queries';
import { listingFiltersSchema } from '@/lib/listings/schemas';
import { PawPrint } from 'lucide-react';

type SP = Record<string, string | string[] | undefined>;

export default async function ListingsPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<SP>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const sp = await searchParams;
	const t = await getTranslations('listings');

	const filters = listingFiltersSchema.parse({
		q: pick(sp.q),
		kind: pick(sp.kind),
		categoryId: pick(sp.categoryId),
		regionId: pick(sp.regionId),
		cityId: pick(sp.cityId),
		districtId: pick(sp.districtId),
		priceMin: pick(sp.priceMin),
		priceMax: pick(sp.priceMax),
		ageMin: pick(sp.ageMin),
		ageMax: pick(sp.ageMax),
		dealType: pick(sp.dealType),
		withPhoto: pick(sp.withPhoto),
		sort: pick(sp.sort),
		page: pick(sp.page),
	});

	const [{ items, total, page, totalPages }, categories, regions] = await Promise.all([
		fetchListings(filters),
		fetchCategories(),
		fetchRegions(),
	]);

	return (
		<div className="container py-6">
			<h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>

			<div className="grid gap-6 lg:grid-cols-[280px,1fr]">
				<aside className="space-y-4">
					<ListingFilters
						categories={categories}
						regions={regions}
						locale={locale}
						initial={filters}
					/>
				</aside>

				<div>
					<div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
						<span>
							{total} {t('title').toLowerCase()}
						</span>
					</div>

					{items.length === 0 ? (
						<Card>
							<CardContent className="py-16 text-center text-muted-foreground">
								<PawPrint className="mx-auto mb-2 h-10 w-10 opacity-50" />
								<p>{t('empty')}</p>
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
								<Pagination page={page} totalPages={totalPages} searchParams={sp} />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function pick(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value[0];
	return value;
}

function Pagination({
	page,
	totalPages,
	searchParams,
}: {
	page: number;
	totalPages: number;
	searchParams: SP;
}) {
	const baseQuery = Object.fromEntries(
		Object.entries(searchParams)
			.filter(([k, v]) => k !== 'page' && v !== undefined)
			.map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v as string)]),
	);
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
		(p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
	);

	return (
		<nav className="mt-8 flex flex-wrap justify-center gap-2">
			{pages.map((p, i) => {
				const prev = pages[i - 1];
				const gap = prev !== undefined && p - prev > 1;
				return (
					<span key={p} className="flex items-center gap-2">
						{gap && <span className="text-muted-foreground">…</span>}
						<Button
							asChild={p !== page}
							variant={p === page ? 'default' : 'outline'}
							size="sm"
						>
							{p === page ? <span>{p}</span> : <Link href={{ pathname: '/listings', query: { ...baseQuery, page: String(p) } }}>{p}</Link>}
						</Button>
					</span>
				);
			})}
		</nav>
	);
}
