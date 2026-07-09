import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { eventCoverUrl } from '@/lib/listings/storage';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

export default async function EventsPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ filter?: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const { filter } = await searchParams;
	const t = await getTranslations('events');

	const supabase = await createClient();
	const now = new Date().toISOString();
	let query = supabase
		.from('events')
		.select('id, title, starts_at, ends_at, city_id, cover_path, organizer, address, cities(name_ru, name_kk)')
		.eq('status', 'published');

	if (filter === 'past') {
		query = query.lt('starts_at', now).order('starts_at', { ascending: false });
	} else {
		query = query.gte('starts_at', now).order('starts_at', { ascending: true });
	}

	const { data } = await query.limit(50);
	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';
	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';

	return (
		<div className="container py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t('title')}</h1>
				<div className="flex gap-2 text-sm">
					<Link
						href={{ pathname: '/events', query: {} }}
						className={`rounded-md px-3 py-1.5 ${filter !== 'past' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
					>
						{t('upcoming')}
					</Link>
					<Link
						href={{ pathname: '/events', query: { filter: 'past' } }}
						className={`rounded-md px-3 py-1.5 ${filter === 'past' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
					>
						{t('past')}
					</Link>
				</div>
			</div>

			{!data || data.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center text-muted-foreground">
						<Calendar className="mx-auto mb-2 h-10 w-10 opacity-30" />
						<p>{t('empty')}</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{data.map((e) => {
						const title = e.title || '—';
						const cover = e.cover_path ? eventCoverUrl(e.cover_path) : null;
						const city = e.cities
							? Array.isArray(e.cities)
								? e.cities[0]
								: e.cities
							: null;
						return (
							<Link key={e.id} href={`/events/${e.id}`}>
								<Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
									<div className="relative aspect-video bg-muted">
										{cover ? (
											<Image
												src={cover}
												alt={title}
												fill
												className="object-contain"
												sizes="400px"
											/>
										) : (
											<div className="flex h-full items-center justify-center text-muted-foreground">
												<Calendar className="h-10 w-10 opacity-30" />
											</div>
										)}
										<Badge className="absolute left-2 top-2">
											{new Intl.DateTimeFormat(localeTag, {
												day: '2-digit',
												month: 'short',
											}).format(new Date(e.starts_at))}
										</Badge>
									</div>
									<CardContent className="space-y-2 p-4">
										<div className="font-semibold line-clamp-2">{title}</div>
										{city && (
											<div className="flex items-center gap-1 text-sm text-muted-foreground">
												<MapPin className="h-3 w-3" />
												{city[localeKey]}
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
