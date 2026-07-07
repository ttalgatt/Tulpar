import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/listings/listing-card';
import { Heart } from 'lucide-react';

export default async function FavoritesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!user) redirect({ href: '/auth/login', locale });

	const t = await getTranslations('listings');
	const supabase = await createClient();
	const { data } = await supabase
		.from('favorites')
		.select(
			'listing_id, listings(id, title, price, currency, deal_type, is_bulk, quantity, unit, age_months, created_at, status, listing_photos(path, order_index))',
		)
		.eq('user_id', user!.id)
		.order('created_at', { ascending: false });

	const items =
		(data ?? [])
			.map((row) => (Array.isArray(row.listings) ? row.listings[0] : row.listings))
			.filter((l) => l && l.status === 'published') ?? [];

	return (
		<div className="container py-8">
			<h1 className="mb-6 text-2xl font-bold">{t('favorites.title')}</h1>

			{items.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center text-muted-foreground">
						<Heart className="mx-auto mb-2 h-10 w-10 opacity-30" />
						<p>{t('favorites.empty')}</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{items.map((l) => l && <ListingCard key={l.id} listing={l} locale={locale} />)}
				</div>
			)}
		</div>
	);
}
