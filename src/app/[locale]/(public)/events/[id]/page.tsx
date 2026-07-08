import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { eventCoverUrl } from '@/lib/listings/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, User } from 'lucide-react';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id, locale } = await params;
	const supabase = await createClient();
	const { data: event } = await supabase
		.from('events')
		.select('title, description, cover_path, starts_at, address, cities(name_ru, name_kk, regions(name_ru, name_kk))')
		.eq('id', id)
		.maybeSingle();
	if (!event) return { title: '404' };

	const isKk = locale === 'kk';
	const localeTag = isKk ? 'kk-KZ' : 'ru-RU';
	const localeKey = isKk ? 'name_kk' : 'name_ru';

	// Build rich title: "{name} — {date}, {city}"
	const city = Array.isArray(event.cities) ? event.cities[0] : event.cities;
	const region = city
		? (Array.isArray((city as {regions?: unknown}).regions) ? ((city as {regions: Array<Record<string,string>>}).regions)[0] : (city as {regions?: Record<string,string>}).regions)
		: null;
	const dateStr = event.starts_at
		? new Intl.DateTimeFormat(localeTag, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(event.starts_at))
		: null;
	const locationStr = [
		city?.[localeKey as keyof typeof city] as string | undefined,
		region?.[localeKey] ?? undefined,
		event.address ?? undefined,
	].filter(Boolean).join(', ') || null;

	const parts = [event.title ?? (isKk ? 'Іс-шара' : 'Событие')];
	if (dateStr || locationStr) {
		parts.push('—');
		if (dateStr) parts.push(dateStr);
		if (locationStr) parts.push(locationStr);
	}
	const title = parts.join(' ');
	const description = (event.description?.trim()
		? event.description
		: title
	).slice(0, 200);

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';
	const url = `${siteUrl}/${isKk ? 'kk/' : ''}events/${id}`;
	const coverUrl = eventCoverUrl(event.cover_path ?? null);

	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title,
			description,
			type: 'website',
			url,
			siteName: 'Бұзау',
			locale: isKk ? 'kk_KZ' : 'ru_KZ',
			...(coverUrl ? { images: [{ url: coverUrl }] } : {}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
		},
	};
}

export default async function EventDetailPage({ params }: PageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('events');
	const supabase = await createClient();
	const { data: event } = await supabase
		.from('events')
		.select(
			'*, cities(name_ru, name_kk, region_id, regions(name_ru, name_kk))',
		)
		.eq('id', id)
		.maybeSingle();
	if (!event) notFound();

	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';
	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const title = event.title || '—';
	const description = event.description;
	const cover = event.cover_path ? eventCoverUrl(event.cover_path) : null;
	const city = event.cities
		? Array.isArray(event.cities)
			? event.cities[0]
			: event.cities
		: null;

	const startDate = new Date(event.starts_at);
	const endDate = event.ends_at ? new Date(event.ends_at) : null;

	return (
		<div className="container py-6">
			{cover && (
				<div className="relative mb-6 aspect-[16/6] w-full overflow-hidden rounded-lg bg-muted">
					<Image src={cover} alt={title} fill className="object-cover" priority sizes="100vw" />
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
					<Card className="mt-6">
						<CardContent className="p-6">
							<p className="whitespace-pre-wrap text-sm">{description || '—'}</p>
						</CardContent>
					</Card>
				</div>
				<div className="space-y-4">
					<Card>
						<CardContent className="space-y-3 p-6 text-sm">
							<div className="flex items-start gap-2">
								<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
								<div>
									<div className="font-medium">{t('date')}</div>
									<div>
										{new Intl.DateTimeFormat(localeTag, {
											day: '2-digit',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										}).format(startDate)}
										{endDate && (
											<>
												{' — '}
												{new Intl.DateTimeFormat(localeTag, {
													day: '2-digit',
													month: 'long',
													hour: '2-digit',
													minute: '2-digit',
												}).format(endDate)}
											</>
										)}
									</div>
								</div>
							</div>
							{city && (
								<div className="flex items-start gap-2">
									<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<div className="font-medium">{t('venue')}</div>
										<div>{city[localeKey]}</div>
										{event.address && (
											<div className="text-muted-foreground">{event.address}</div>
										)}
									</div>
								</div>
							)}
							{event.organizer && (
								<div className="flex items-start gap-2">
									<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<div className="font-medium">{t('organizer')}</div>
										<div>{event.organizer}</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
