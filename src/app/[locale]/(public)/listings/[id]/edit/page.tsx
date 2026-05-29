import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth';
import { fetchListing, fetchCategories, fetchRegions } from '@/lib/listings/queries';
import { photoPublicUrl } from '@/lib/listings/storage';
import { ListingWizard } from '@/components/listings/listing-wizard';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!user) redirect({ href: '/auth/login', locale });

	const listing = await fetchListing(id);
	if (!listing) notFound();
	if (listing.owner_id !== user!.id) redirect({ href: '/my/listings', locale });

	const t = await getTranslations('listings');
	const [categories, regions] = await Promise.all([fetchCategories(), fetchRegions()]);

	const photos = ((listing.listing_photos ?? []) as Array<{ path: string; order_index: number }>)
		.slice()
		.sort((a, b) => a.order_index - b.order_index)
		.map((p, i) => ({ path: p.path, url: photoPublicUrl(p.path), orderIndex: i }));

	return (
		<div className="container max-w-3xl py-8">
			<h1 className="mb-6 text-2xl font-bold">{t('editTitle')}</h1>
			<ListingWizard
				mode="edit"
				listingId={id}
				userId={user!.id}
				categories={categories}
				regions={regions}
				locale={locale}
				initial={{
					categoryId: listing.category_id,
					regionId: listing.region_id,
					cityId: listing.city_id,
					districtId: listing.district_id,
					title: listing.title ?? '',
					description: listing.description ?? '',
					price: listing.price ?? null,
					currency: listing.currency,
					dealType: listing.deal_type,
					quantity: listing.quantity ?? null,
					unit: listing.unit ?? null,
					isBulk: listing.is_bulk,
					photos,
				}}
			/>
		</div>
	);
}
