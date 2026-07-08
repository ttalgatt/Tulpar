import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import { formatPrice, formatRelativeDate, cn, listingSlug } from '@/lib/utils';
import { photoPublicUrl } from '@/lib/listings/storage';
import { getTranslations } from 'next-intl/server';
import type { ListingListItem } from '@/lib/listings/queries';

interface Props {
	listing: ListingListItem;
	locale: string;
	className?: string;
	priority?: boolean;
}

export async function ListingCard({ listing, locale, className, priority = false }: Props) {
	const t = await getTranslations('listings');
	const title = listing.title || '—';
	const photos = (listing.listing_photos ?? []).slice().sort((a, b) => a.order_index - b.order_index);
	const cover = photos[0]?.path ? photoPublicUrl(photos[0].path) : null;
	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';

	const slug = listingSlug(listing.title, listing.regions?.name_ru ?? null, listing.slug ?? listing.id);

	return (
		<Link href={`/listings/${slug}`}>
			<Card
				className={cn(
					'group h-full overflow-hidden transition-shadow hover:shadow-md',
					className,
				)}
			>
				<div className="relative aspect-square w-full bg-muted">
					{cover ? (
					<Image
						src={cover}
						alt={title}
						fill
						sizes="(min-width: 1280px) 17vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
						className="object-cover transition-transform group-hover:scale-105"
						priority={priority}
					/>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<ImageIcon className="h-12 w-12 opacity-30" />
						</div>
					)}
					{listing.deal_type === 'gift' && (
						<Badge variant="accent" className="absolute left-2 top-2">
							{t('card.gift')}
						</Badge>
					)}
					{listing.is_bulk && (
						<Badge variant="secondary" className="absolute right-2 top-2">
							{t('card.bulk')}
						</Badge>
					)}
				</div>
				<div className="p-3">
					<div className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{title}</div>
					<div className="mt-1 text-base font-bold">
						{listing.deal_type === 'gift'
							? t('card.gift')
							: formatPrice(listing.price, listing.currency, localeTag) ?? '—'}
						{listing.is_bulk && listing.quantity && listing.unit ? (
							<span className="ml-1 text-xs font-normal text-muted-foreground">
								/ {listing.quantity} {t(`units.${listing.unit}`)}
							</span>
						) : null}
					</div>
					<div className="mt-1 text-xs text-muted-foreground">
						{formatRelativeDate(listing.created_at, localeTag)}
					</div>
				</div>
			</Card>
		</Link>
	);
}
