import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { fetchListing } from '@/lib/listings/queries';
import { formatPrice, formatRelativeDate, formatAge, listingSlug } from '@/lib/utils';
import { photoPublicUrl } from '@/lib/listings/storage';
import { getCurrentUser, isModerator } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactSellerButton } from '@/components/listings/contact-seller-button';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { Gallery } from '@/components/listings/gallery';
import { ViewTracker } from '@/components/listings/view-tracker';
import { ReportButton } from '@/components/listings/report-button';
import { AdminTakeDownButton } from '@/components/admin/admin-take-down-button';
import { Eye, MapPin, User as UserIcon } from 'lucide-react';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id, locale } = await params;
	const listing = await fetchListing(id);
	if (!listing) return { title: '404' };

	const isKk = locale === 'kk';
	const localeTag = isKk ? 'kk-KZ' : 'ru-RU';
	const localeKey = isKk ? 'name_kk' : 'name_ru';

	const region = Array.isArray(listing.regions) ? listing.regions[0] : listing.regions;
	const regionName = region?.[localeKey] ?? null;

	// Build rich title: "Корова, 1 год 8 мес. — 22 222 KZT, ВКО"
	const parts: string[] = [];
	if (listing.title) parts.push(listing.title);
	if ((listing.age_months as number | null) != null) {
		parts[0] = [parts[0], formatAge(listing.age_months as number, locale)].filter(Boolean).join(', ');
	}
	const priceStr =
		listing.deal_type === 'gift'
			? (isKk ? 'Тегін' : 'Даром')
			: (formatPrice(listing.price, listing.currency, localeTag) ?? null);
	if (priceStr) parts.push(`— ${priceStr}`);
	if (regionName) parts.push(regionName);
	const title = parts.join(' ');

	// Description: first 200 chars of listing description, or fallback to title
	const description = (listing.description?.trim() ? listing.description : title).slice(0, 200);

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';
	const slug = listingSlug(listing.title, region?.name_ru ?? null, listing.slug ?? listing.id);
	const url = `${siteUrl}/${isKk ? 'kk/' : ''}listings/${slug}`;

	return {
		title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			title,
			description,
			type: 'website',
			url,
			siteName: 'Бұзау.kz',
			locale: isKk ? 'kk_KZ' : 'ru_KZ',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
		},
	};
}

export default async function ListingDetailPage({ params }: PageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);
	const listing = await fetchListing(id);
	if (!listing) notFound();

	const user = await getCurrentUser();
	const canView =
		listing.status === 'published' ||
		user?.id === listing.owner_id ||
		isModerator(user);
	if (!canView) notFound();

	const t = await getTranslations('listings');
	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';
	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	let isFavorite = false;
	if (user) {
		const supabase = await createClient();
		const { data } = await supabase
			.from('favorites')
			.select('listing_id')
			.eq('user_id', user.id)
			.eq('listing_id', listing.id)
			.maybeSingle();
		isFavorite = !!data;
	}

	const title = listing.title || '—';
	const description = listing.description;

	const photos = ((listing.listing_photos ?? []) as Array<{ path: string; order_index: number }>)
		.slice()
		.sort((a, b) => a.order_index - b.order_index)
		.map((p) => photoPublicUrl(p.path));

	const seller = listing.profiles as { full_name?: string | null; phone?: string | null } | null;
	const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
	const city = Array.isArray(listing.cities) ? listing.cities[0] : listing.cities;
	const region = Array.isArray(listing.regions) ? listing.regions[0] : listing.regions;
	const district = Array.isArray(listing.districts) ? listing.districts[0] : listing.districts;
	const locationParts = [region?.[localeKey], city?.[localeKey], district?.[localeKey]].filter(
		Boolean,
	);

	const isOwner = user?.id === listing.owner_id;
	const showStatusBanner = listing.status !== 'published' && canView;
	const canTakeDown = isModerator(user) && listing.status === 'published';
	const pageSlug = listingSlug(listing.title, region?.name_ru ?? null, listing.slug ?? listing.id);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';
	const pageUrl = `${siteUrl}${locale === 'kk' ? '/kk' : ''}/listings/${pageSlug}`;

	return (
		<div className="container py-6">
			<ViewTracker listingId={listing.id} />

			{showStatusBanner && (
				<div
					className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
						listing.status === 'pending'
							? 'border-yellow-300 bg-yellow-50 text-yellow-800'
							: listing.status === 'rejected'
								? 'border-red-300 bg-red-50 text-red-800'
								: 'border-gray-200 bg-gray-50 text-gray-700'
					}`}
				>
					<p>{t(`statuses.${listing.status}`)}</p>
					{listing.status === 'rejected' && listing.rejection_reason && (
						<p className="mt-1 font-normal">
							<span className="font-medium">{t('my.rejectionReason')}: </span>
							{listing.rejection_reason}
						</p>
					)}
				</div>
			)}

		<nav className="mb-4 text-sm text-muted-foreground">
			<Link href="/listings" className="hover:underline">
				{t('title')}
			</Link>
			{category && (
				<>
					<span className="mx-2">/</span>
					<Link
						href={{ pathname: '/listings', query: { kind: category.kind } }}
						className="hover:underline"
					>
						{category[localeKey]}
					</Link>
				</>
			)}
		</nav>

			<div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
				<div>
					<Gallery images={photos} alt={title} />

					<Card className="mt-6">
						<CardContent className="p-6">
							<h2 className="mb-3 text-lg font-semibold">{t('detail.description')}</h2>
							<p className="whitespace-pre-wrap text-sm">{description || '—'}</p>
						</CardContent>
					</Card>

					{listing.listing_attributes && listing.listing_attributes.length > 0 && (
						<Card className="mt-6">
							<CardContent className="p-6">
								<h2 className="mb-3 text-lg font-semibold">
									{t('detail.characteristics')}
								</h2>
								<dl className="grid gap-2 sm:grid-cols-2">
									{(
										listing.listing_attributes as Array<{
											attribute_key: string;
											value_text: string | null;
											value_num: number | null;
											value_bool: boolean | null;
										}>
									).map((attr) => (
										<div
											key={attr.attribute_key}
											className="flex justify-between border-b py-1.5 text-sm"
										>
											<dt className="text-muted-foreground">{attr.attribute_key}</dt>
											<dd className="font-medium">
												{attr.value_text ?? attr.value_num ?? String(attr.value_bool ?? '')}
											</dd>
										</div>
									))}
								</dl>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-4">
					<Card>
						<CardContent className="p-6">
							<h1 className="text-xl font-bold">{title}</h1>
							<div className="mt-3 flex flex-wrap gap-2">
								{listing.deal_type === 'gift' ? (
									<Badge variant="accent">{t('dealTypes.gift')}</Badge>
								) : (
									<Badge>{t(`dealTypes.${listing.deal_type}`)}</Badge>
								)}
								{listing.is_bulk && <Badge variant="secondary">{t('card.bulk')}</Badge>}
							</div>
							<div className="mt-4 text-3xl font-bold">
								{listing.deal_type === 'gift'
									? t('card.gift')
									: formatPrice(listing.price, listing.currency, localeTag) ?? '—'}
							</div>
						{listing.quantity && listing.unit && (
							<div className="mt-1 text-sm text-muted-foreground">
								{listing.quantity} {t(`units.${listing.unit}`)}
							</div>
						)}
						{(listing.age_months as number | null) != null && (
							<div className="mt-1 text-sm text-muted-foreground">
								{t('fields.age')}: {formatAge(listing.age_months as number, locale)}
							</div>
						)}

							<div className="mt-6 flex flex-col gap-2">
								<ContactSellerButton
									ownerId={listing.owner_id}
									phone={(listing.contact_phone as string | null) ?? seller?.phone ?? null}
									isAuthenticated={!!user}
								/>
								<FavoriteButton
									listingId={listing.id}
									initial={isFavorite}
									authenticated={!!user}
								/>
							</div>

							{user && !isOwner && listing.status === 'published' && (
								<div className="mt-2">
									<ReportButton listingId={listing.id} />
								</div>
							)}
							{canTakeDown && (
								<div className="mt-2">
									<AdminTakeDownButton listingId={listing.id} className="w-full" />
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="space-y-3 p-6 text-sm">
							{locationParts.length > 0 && (
								<div className="flex items-start gap-2">
									<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<span>{locationParts.join(', ')}</span>
								</div>
							)}
							{seller && (
								<div className="flex items-start gap-2">
									<UserIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<span>
										<div className="font-medium">{seller.full_name || t('detail.seller')}</div>
									</span>
								</div>
							)}
							<div className="flex items-center gap-2 text-muted-foreground">
								<Eye className="h-4 w-4" />
								{t('detail.views', { count: listing.views_count ?? 0 })}
							</div>
							<div className="text-xs text-muted-foreground">
								{t('detail.published')}: {formatRelativeDate(listing.created_at, localeTag)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<ClassifiedAdJsonLd
				title={title}
				description={description ?? ''}
				price={listing.price}
				currency={listing.currency}
				images={photos}
				url={pageUrl}
				datePosted={listing.created_at}
				sellerName={seller?.full_name ?? null}
				category={category?.[localeKey] ?? null}
				areaServed={locationParts.join(', ') || null}
			/>
		</div>
	);
}

function ClassifiedAdJsonLd({
	title,
	description,
	price,
	currency,
	images,
	url,
	datePosted,
	sellerName,
	category,
	areaServed,
}: {
	title: string;
	description: string;
	price: number | null;
	currency: string;
	images: string[];
	url: string;
	datePosted: string;
	sellerName: string | null;
	category: string | null;
	areaServed: string | null;
}) {
	const data: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'ClassifiedAd',
		name: title,
		description,
		url,
		datePosted,
		image: images.length > 0 ? images : undefined,
		category: category || undefined,
		areaServed: areaServed || undefined,
		seller: sellerName
			? {
					'@type': 'Person',
					name: sellerName,
				}
			: undefined,
	};

	if (price != null) {
		data.offers = {
			'@type': 'Offer',
			url,
			price,
			priceCurrency: currency,
			availability: 'https://schema.org/InStock',
		};
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
