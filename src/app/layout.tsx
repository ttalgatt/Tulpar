import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: {
		default: 'Бұзау',
		template: '%s · Бұзау',
	},
	description: 'Бұзау — маркетплейс объявлений о животных по всему Казахстану',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning className={cn(inter.variable, 'h-full')}>
			<body className="flex min-h-full flex-col font-sans antialiased">{children}</body>
		</html>
	);
}
