import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/listings/listing-card';
import { HomeSearch } from '@/components/listings/home-search';
import { fetchCategories, fetchRegions } from '@/lib/listings/queries';
import Image from 'next/image';
import { ArrowRight, PawPrint, Calendar } from 'lucide-react';
import { eventCoverUrl } from '@/lib/listings/storage';

export const revalidate = 60;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const isKk = locale === 'kk';
	const title = isKk
		? 'Бұзау — Қазақстандағы мал, үй жануарлары және тауарлар хабарландырулары'
		: 'Бұзау — объявления о продаже скота, домашних животных и товаров в Казахстане';
	const description = isKk
		? 'Қазақстан бойынша мал, үй жануарлары, тауарлар мен қызметтерді сату-сатып алу хабарландырулары.'
		: 'Покупайте и продавайте скот, домашних животных, товары и услуги по всему Казахстану.';
	return { title, description };
}

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('home');

	const supabase = await createClient();
	const [categories, regions] = await Promise.all([fetchCategories(), fetchRegions()]);
	const { data: recentListings } = await supabase
		.from('listings')
		.select(
			'id, slug, title, price, currency, deal_type, is_bulk, quantity, unit, age_months, created_at, status, listing_photos(path, order_index), regions(name_ru)',
		)
		.eq('status', 'published')
		.order('created_at', { ascending: false })
		.limit(12);

	const { data: events } = await supabase
		.from('events')
		.select('id, title, starts_at, cover_path')
		.eq('status', 'published')
		.gte('starts_at', new Date().toISOString())
		.order('starts_at', { ascending: true })
		.limit(2);

	return (
		<div>
			<section className="border-b bg-gradient-to-br from-muted/60 via-background to-accent/10">
				<div className="container py-6 md:py-8">
					<HomeSearch categories={categories} regions={regions} locale={locale} />
				</div>
			</section>

			<section className="container py-12">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold">{t('recentListings')}</h2>
					<Button asChild variant="ghost">
						<Link href="/listings">
							{t('viewAll')}
							<ArrowRight className="ml-1 h-4 w-4" />
						</Link>
					</Button>
				</div>
				{recentListings && recentListings.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
					{recentListings.map((l, i) => (
						<ListingCard key={l.id} listing={l} locale={locale} priority={i < 6} />
					))}
					</div>
				) : (
					<EmptyState />
				)}
			</section>

			{events && events.length > 0 && (
				<section className="container py-12">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-bold">{t('upcomingEvents')}</h2>
						<Button asChild variant="ghost">
							<Link href="/events">
								{t('viewAll')}
								<ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</Button>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{events.map((e) => {
							const cover = eventCoverUrl(e.cover_path);
							const dateStr = new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
								day: '2-digit',
								month: 'long',
								year: 'numeric',
							}).format(new Date(e.starts_at));
							return (
								<Card key={e.id} className="overflow-hidden">
									{cover ? (
										<div className="relative aspect-video w-full bg-muted">
											<Image
												src={cover}
												alt={e.title ?? ''}
												fill
												sizes="(min-width: 640px) 50vw, 100vw"
												className="object-cover"
											/>
										</div>
									) : (
										<div className="flex aspect-video w-full items-center justify-center bg-muted">
											<Calendar className="h-10 w-10 text-muted-foreground opacity-30" />
										</div>
									)}
									<CardContent className="p-4">
										<div className="font-semibold leading-snug">{e.title}</div>
										<div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
											<Calendar className="h-3.5 w-3.5 shrink-0" />
											{dateStr}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
}

function EmptyState() {
	return (
		<Card>
			<CardContent className="py-12 text-center text-muted-foreground">
				<PawPrint className="mx-auto mb-2 h-10 w-10 opacity-50" />
				<p>Объявлений пока нет</p>
			</CardContent>
		</Card>
	);
}
