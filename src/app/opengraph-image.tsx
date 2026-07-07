import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Бұзау — маркетплейс животных Казахстана';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					background: 'linear-gradient(135deg, #1a4731 0%, #0f2d1e 100%)',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'sans-serif',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* decorative circle */}
				<div
					style={{
						position: 'absolute',
						width: 600,
						height: 600,
						borderRadius: '50%',
						background: 'rgba(212, 160, 23, 0.08)',
						top: -150,
						right: -150,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: 400,
						height: 400,
						borderRadius: '50%',
						background: 'rgba(212, 160, 23, 0.06)',
						bottom: -100,
						left: -100,
					}}
				/>

				{/* logo text */}
				<div
					style={{
						fontSize: 120,
						fontWeight: 900,
						color: '#d4a017',
						letterSpacing: '-4px',
						lineHeight: 1,
						marginBottom: 24,
					}}
				>
					Бұзау
				</div>

				{/* tagline */}
				<div
					style={{
						fontSize: 32,
						color: 'rgba(255,255,255,0.85)',
						fontWeight: 400,
						letterSpacing: '0.02em',
					}}
				>
					Маркетплейс животных Казахстана
				</div>

				{/* domain badge */}
				<div
					style={{
						marginTop: 48,
						paddingTop: 12,
						paddingBottom: 12,
						paddingLeft: 28,
						paddingRight: 28,
						background: 'rgba(212, 160, 23, 0.2)',
						border: '1px solid rgba(212, 160, 23, 0.4)',
						borderRadius: 40,
						fontSize: 24,
						color: '#d4a017',
						fontWeight: 600,
					}}
				>
					buzau.kz
				</div>
			</div>
		),
		{ ...size },
	);
}
