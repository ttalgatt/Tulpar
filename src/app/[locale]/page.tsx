import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/listings/listing-card';
import { ArrowRight, PawPrint, Cog, Calendar, Search } from 'lucide-react';

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('home');
	const tCommon = await getTranslations('common');

	const supabase = await createClient();
	const { data: recentListings } = await supabase
		.from('listings')
		.select(
			'id, title_ru, title_kk, price, currency, deal_type, is_bulk, quantity, unit, created_at, status, listing_photos(path, order_index)',
		)
		.eq('status', 'published')
		.order('created_at', { ascending: false })
		.limit(8);

	const { data: events } = await supabase
		.from('events')
		.select('id, title_ru, title_kk, starts_at, cover_path')
		.eq('status', 'published')
		.gte('starts_at', new Date().toISOString())
		.order('starts_at', { ascending: true })
		.limit(3);

	return (
		<div>
			<section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
				<div className="container py-16 md:py-24">
					<div className="max-w-3xl">
						<h1 className="text-3xl md:text-5xl font-bold tracking-tight">{t('heroTitle')}</h1>
						<p className="mt-4 text-lg text-muted-foreground">{t('heroSubtitle')}</p>
						<form action={`/${locale}/listings`} className="mt-8 flex max-w-2xl gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									type="search"
									name="q"
									placeholder={t('searchPlaceholder')}
									className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								/>
							</div>
							<Button type="submit" size="lg">
								{tCommon('search')}
							</Button>
						</form>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button asChild variant="outline">
								<Link href="/listings">{t('browseAll')}</Link>
							</Button>
							<Button asChild>
								<Link href="/listings/new">{t('createCta')}</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="container py-12">
				<h2 className="mb-6 text-2xl font-bold">{t('popularCategories')}</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<CategoryCard
						href={{ pathname: '/listings', query: { kind: 'pets' } }}
						title={locale === 'kk' ? 'Үй жануарлары' : 'Домашние животные'}
						icon={<PawPrint className="h-8 w-8" />}
					/>
					<CategoryCard
						href={{ pathname: '/listings', query: { kind: 'livestock' } }}
						title={locale === 'kk' ? 'Мал' : 'Скот'}
						icon={<PawPrint className="h-8 w-8" />}
					/>
					<CategoryCard
						href={{ pathname: '/listings', query: { kind: 'goods' } }}
						title={locale === 'kk' ? 'Тауарлар' : 'Товары'}
						icon={<Cog className="h-8 w-8" />}
					/>
					<CategoryCard
						href={{ pathname: '/listings', query: { kind: 'services' } }}
						title={locale === 'kk' ? 'Қызметтер' : 'Услуги'}
						icon={<Cog className="h-8 w-8" />}
					/>
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
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{recentListings.map((l) => (
							<ListingCard key={l.id} listing={l} locale={locale} />
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
					<div className="grid gap-4 md:grid-cols-3">
						{events.map((e) => (
							<Card key={e.id}>
								<CardContent className="p-4">
									<Calendar className="mb-2 h-5 w-5 text-primary" />
									<div className="font-semibold">
										{locale === 'kk' ? e.title_kk ?? e.title_ru : e.title_ru}
									</div>
									<div className="mt-1 text-sm text-muted-foreground">
										{new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
											day: '2-digit',
											month: 'long',
										}).format(new Date(e.starts_at))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

function CategoryCard({
	href,
	title,
	icon,
}: {
	href: { pathname: '/listings'; query: Record<string, string> };
	title: string;
	icon: React.ReactNode;
}) {
	return (
		<Link href={href}>
			<Card className="transition-shadow hover:shadow-md">
				<CardContent className="flex items-center gap-4 p-6">
					<div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
					<div className="font-semibold">{title}</div>
				</CardContent>
			</Card>
		</Link>
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
