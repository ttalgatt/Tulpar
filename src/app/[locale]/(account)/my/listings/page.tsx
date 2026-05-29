import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingActionsMenu } from '@/components/listings/listing-actions-menu';
import { photoPublicUrl } from '@/lib/listings/storage';
import { formatPrice, formatRelativeDate } from '@/lib/utils';
import { ImageIcon, Plus } from 'lucide-react';
import Image from 'next/image';

export default async function MyListingsPage({
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
	const { data: listings } = await supabase
		.from('listings')
		.select(
			'id, title, price, currency, status, created_at, listing_photos(path, order_index)',
		)
		.eq('owner_id', user!.id)
		.order('created_at', { ascending: false });

	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';

	return (
		<div className="container max-w-4xl py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t('my.title')}</h1>
				<Button asChild>
					<Link href="/listings/new">
						<Plus className="mr-1 h-4 w-4" />
						{t('actions.create')}
					</Link>
				</Button>
			</div>

			{!listings || listings.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center">
						<p className="mb-4 text-muted-foreground">{t('my.empty')}</p>
						<Button asChild>
							<Link href="/listings/new">{t('my.createFirst')}</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{listings.map((l) => {
						const photos = (l.listing_photos ?? []).slice().sort((a, b) => a.order_index - b.order_index);
						const cover = photos[0]?.path ? photoPublicUrl(photos[0].path) : null;
						const title = l.title || '—';
						return (
							<Card key={l.id}>
								<CardContent className="flex items-center gap-4 p-3">
									<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
										{cover ? (
											<Image src={cover} alt={title} fill className="object-cover" sizes="80px" />
										) : (
											<div className="flex h-full items-center justify-center text-muted-foreground">
												<ImageIcon className="h-8 w-8 opacity-30" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<Link
											href={`/listings/${l.id}`}
											className="line-clamp-1 font-medium hover:underline"
										>
											{title}
										</Link>
										<div className="mt-1 flex items-center gap-2 text-sm">
											<StatusBadge status={l.status} t={t} />
											<span className="text-muted-foreground">
												{formatRelativeDate(l.created_at, localeTag)}
											</span>
										</div>
									</div>
									<div className="hidden text-right text-sm font-semibold sm:block">
										{formatPrice(l.price, l.currency, localeTag) ?? '—'}
									</div>
									<ListingActionsMenu listingId={l.id} status={l.status} />
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}

function StatusBadge({
	status,
	t,
}: {
	status: string;
	t: Awaited<ReturnType<typeof getTranslations<'listings'>>>;
}) {
	const variant =
		status === 'published'
			? 'default'
			: status === 'pending'
				? 'secondary'
				: status === 'rejected'
					? 'destructive'
					: 'outline';
	return <Badge variant={variant as never}>{t(`statuses.${status}` as never)}</Badge>;
}
