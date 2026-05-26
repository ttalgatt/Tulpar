import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModerationActions } from '@/components/admin/moderation-actions';
import { photoPublicUrl } from '@/lib/listings/storage';
import { formatRelativeDate } from '@/lib/utils';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

export default async function ModerationPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('admin');
	const supabase = await createClient();

	const { data: items } = await supabase
		.from('listings')
		.select(
			'id, title_ru, title_kk, status, created_at, owner_id, listing_photos(path, order_index), profiles!listings_owner_id_fkey(full_name)',
		)
		.eq('status', 'pending')
		.order('created_at', { ascending: true })
		.limit(100);

	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';

	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">
				{t('queue')} ({items?.length ?? 0})
			</h2>
			<div className="space-y-3">
				{(items ?? []).map((l) => {
					const title =
						(locale === 'kk' ? l.title_kk : l.title_ru) || l.title_ru || l.title_kk || '—';
					const photos = (l.listing_photos ?? [])
						.slice()
						.sort((a, b) => a.order_index - b.order_index);
					const cover = photos[0]?.path ? photoPublicUrl(photos[0].path) : null;
					const profile = l.profiles
						? Array.isArray(l.profiles)
							? l.profiles[0]
							: l.profiles
						: null;
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
								<div className="min-w-0 flex-1">
									<Link
										href={`/listings/${l.id}`}
										className="line-clamp-1 font-medium hover:underline"
										target="_blank"
									>
										{title}
									</Link>
									<div className="mt-1 flex items-center gap-2 text-sm">
										<Badge variant="secondary">pending</Badge>
										<span className="text-muted-foreground">
											{profile?.full_name} · {formatRelativeDate(l.created_at, localeTag)}
										</span>
									</div>
								</div>
								<ModerationActions listingId={l.id} />
							</CardContent>
						</Card>
					);
				})}
				{(!items || items.length === 0) && (
					<Card>
						<CardContent className="py-12 text-center text-muted-foreground">
							Очередь пуста
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
