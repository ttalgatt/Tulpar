import { ImageResponse } from 'next/og';
import { fetchListing } from '@/lib/listings/queries';
import { photoPublicUrl } from '@/lib/listings/storage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
	params: Promise<{ locale: string; id: string }>;
}

export default async function OgImage({ params }: Props) {
	const { id } = await params;
	const listing = await fetchListing(id);

	const title = listing?.title ?? 'Объявление';
	const price =
		listing?.deal_type === 'gift'
			? 'Даром'
			: listing?.price
				? new Intl.NumberFormat('ru-KZ', {
						style: 'currency',
						currency: listing.currency ?? 'KZT',
						maximumFractionDigits: 0,
					}).format(listing.price)
				: null;

	const photoPath = listing?.listing_photos?.[0]?.path;
	const photoUrl = photoPath ? photoPublicUrl(photoPath) : null;

	const category =
		listing?.categories && !Array.isArray(listing.categories)
			? (listing.categories as { name_ru?: string }).name_ru
			: Array.isArray(listing?.categories)
				? (listing?.categories[0] as { name_ru?: string })?.name_ru
				: null;

	const cityRaw = listing?.cities;
	const city = cityRaw
		? Array.isArray(cityRaw)
			? (cityRaw[0] as { name_ru?: string })?.name_ru
			: (cityRaw as { name_ru?: string })?.name_ru
		: null;

	return new ImageResponse(
		(
			<div
				style={{
					background: '#0f2d1e',
					width: '100%',
					height: '100%',
					display: 'flex',
					fontFamily: 'sans-serif',
					overflow: 'hidden',
				}}
			>
				{/* left: photo or branded placeholder */}
				<div
					style={{
						width: '50%',
						height: '100%',
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#1a4731',
						overflow: 'hidden',
					}}
				>
					{photoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={photoUrl}
							alt=""
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>
					) : (
						<div
							style={{
								fontSize: 80,
								color: 'rgba(212,160,23,0.3)',
							}}
						>
							🐾
						</div>
					)}
					{/* dark overlay on photo */}
					{photoUrl && (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background: 'linear-gradient(to right, transparent 60%, #0f2d1e)',
							}}
						/>
					)}
				</div>

				{/* right: text content */}
				<div
					style={{
						flex: 1,
						padding: '48px 52px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					{/* top: category */}
					{category && (
						<div
							style={{
								fontSize: 22,
								color: '#d4a017',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.08em',
							}}
						>
							{category}
						</div>
					)}

					{/* middle: title + price */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
						<div
							style={{
								fontSize: title.length > 40 ? 34 : 42,
								fontWeight: 800,
								color: '#ffffff',
								lineHeight: 1.2,
								display: '-webkit-box',
								WebkitLineClamp: 3,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}
						>
							{title}
						</div>
						{price && (
							<div
								style={{
									fontSize: 52,
									fontWeight: 900,
									color: '#d4a017',
									lineHeight: 1,
								}}
							>
								{price}
							</div>
						)}
					</div>

					{/* bottom: location + site */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						{city && (
							<div
								style={{
									fontSize: 22,
									color: 'rgba(255,255,255,0.6)',
									display: 'flex',
									alignItems: 'center',
									gap: 8,
								}}
							>
								📍 {city}
							</div>
						)}
						<div
							style={{
								fontSize: 22,
								color: 'rgba(212,160,23,0.8)',
								fontWeight: 600,
							}}
						>
							buzau.kz
						</div>
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
