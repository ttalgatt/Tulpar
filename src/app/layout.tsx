import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });

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
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning className={cn(inter.variable, 'h-full')}>
			<body className="flex min-h-full flex-col font-sans antialiased">{children}</body>
		</html>
	);
}
