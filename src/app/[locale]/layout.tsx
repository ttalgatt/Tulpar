import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { locales, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

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
		<NextIntlClientProvider locale={locale as Locale} messages={messages}>
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
			<Toaster />
		</NextIntlClientProvider>
	);
}
