import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Comfortaa } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });
const comfortaa = Comfortaa({ subsets: ['latin', 'cyrillic'], variable: '--font-heading', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: 'Бұзау',
		template: '%s · Бұзау',
	},
	description: 'Бұзау — маркетплейс объявлений о животных по всему Казахстану',
	openGraph: {
		siteName: 'Бұзау',
		type: 'website',
		locale: 'ru_KZ',
		url: SITE_URL,
	},
	twitter: {
		card: 'summary_large_image',
	},
	verification: {
		yandex: '603ca421b7195d72',
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning className={cn(inter.variable, comfortaa.variable, 'h-full')}>
			<body className="flex min-h-full flex-col font-sans antialiased">{children}</body>
		</html>
	);
}
