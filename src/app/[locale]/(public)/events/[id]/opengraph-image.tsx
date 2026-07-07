import { ImageResponse } from 'next/og';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { eventCoverUrl } from '@/lib/listings/storage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
	params: Promise<{ locale: string; id: string }>;
}

export default async function OgImage({ params }: Props) {
	const { id } = await params;
	const supabase = createServiceRoleClient();
	const { data: event } = await supabase
		.from('events')
		.select('title, starts_at, cover_path, cities(name_ru)')
		.eq('id', id)
		.maybeSingle();

	const title = event?.title ?? 'Событие';
	const coverUrl = event?.cover_path ? eventCoverUrl(event.cover_path) : null;

	const cityRaw = event?.cities;
	const city = cityRaw
		? Array.isArray(cityRaw)
			? (cityRaw[0] as { name_ru?: string })?.name_ru
			: (cityRaw as { name_ru?: string })?.name_ru
		: null;

	const dateStr = event?.starts_at
		? new Intl.DateTimeFormat('ru-KZ', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}).format(new Date(event.starts_at))
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
				{/* cover image */}
				{coverUrl && (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={coverUrl}
							alt=""
							style={{
								position: 'absolute',
								inset: 0,
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								opacity: 0.35,
							}}
						/>
					</>
				)}

				{/* dark gradient overlay */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(to top, rgba(15,45,30,0.98) 0%, rgba(15,45,30,0.7) 50%, rgba(15,45,30,0.4) 100%)',
					}}
				/>

				{/* content */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						padding: '52px 64px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}
				>
					{/* top badge */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div
							style={{
								paddingTop: 8,
								paddingBottom: 8,
								paddingLeft: 20,
								paddingRight: 20,
								background: 'rgba(212,160,23,0.25)',
								border: '1px solid rgba(212,160,23,0.5)',
								borderRadius: 30,
								fontSize: 22,
								color: '#d4a017',
								fontWeight: 700,
								letterSpacing: '0.06em',
								textTransform: 'uppercase',
							}}
						>
							Событие
						</div>
					</div>

					{/* middle: title */}
					<div
						style={{
							fontSize: title.length > 50 ? 44 : 58,
							fontWeight: 900,
							color: '#ffffff',
							lineHeight: 1.15,
							maxWidth: '80%',
						}}
					>
						{title}
					</div>

					{/* bottom: date + location + site */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						<div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
							{dateStr && (
								<div
									style={{
										fontSize: 26,
										color: 'rgba(255,255,255,0.85)',
										display: 'flex',
										alignItems: 'center',
										gap: 8,
									}}
								>
									📅 {dateStr}
								</div>
							)}
							{city && (
								<div
									style={{
										fontSize: 26,
										color: 'rgba(255,255,255,0.7)',
										display: 'flex',
										alignItems: 'center',
										gap: 8,
									}}
								>
									📍 {city}
								</div>
							)}
						</div>
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
