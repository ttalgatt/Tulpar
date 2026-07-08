import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
	title: 'Контакты — Бұзау',
	description: 'Свяжитесь с командой Бұзау по адресу support@buzau.kz',
};

export default async function ContactsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const isKk = locale === 'kk';

	return (
		<div className="container py-16 max-w-lg text-center">
			<h1 className="text-3xl font-bold mb-3">
				{isKk ? 'Байланыс' : 'Контакты'}
			</h1>
			<p className="text-muted-foreground mb-10">
				{isKk
					? 'Сұрақтарыңыз болса — хат жазыңыз, жауап береміз.'
					: 'Если у вас есть вопросы — напишите нам, мы ответим.'}
			</p>

			<a
				href="mailto:support@buzau.kz"
				className="inline-flex items-center gap-3 rounded-xl border bg-card px-8 py-5 text-lg font-medium shadow-sm transition-shadow hover:shadow-md"
			>
				<Mail className="h-5 w-5 text-primary" />
				support@buzau.kz
			</a>
		</div>
	);
}
