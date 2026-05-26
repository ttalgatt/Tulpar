import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { locales, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!(locales as readonly string[]).includes(locale)) notFound();
	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning className={cn(inter.variable, 'h-full')}>
			<body className="flex min-h-full flex-col font-sans antialiased">
				<NextIntlClientProvider locale={locale as Locale} messages={messages}>
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
					<Toaster />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
