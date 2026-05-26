import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventForm } from '@/components/admin/event-form';
import { AdminEventActions } from '@/components/admin/event-actions';

export default async function AdminEventsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('admin');
	const supabase = await createClient();

	const [{ data: events }, { data: regions }, { data: cities }] = await Promise.all([
		supabase.from('events').select('*').order('starts_at', { ascending: false }).limit(100),
		supabase.from('regions').select('*').order('name_ru'),
		supabase.from('cities').select('*').order('name_ru'),
	]);

	return (
		<div className="space-y-6">
			<section>
				<h2 className="mb-4 text-xl font-semibold">Создать событие</h2>
				<Card>
					<CardContent className="p-6">
						<EventForm regions={regions ?? []} cities={cities ?? []} locale={locale} />
					</CardContent>
				</Card>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-semibold">{t('events')}</h2>
				<div className="space-y-2">
					{(events ?? []).map((e) => {
						const title =
							(locale === 'kk' ? e.title_kk : e.title_ru) || e.title_ru || '—';
						return (
							<Card key={e.id}>
								<CardContent className="flex items-center justify-between gap-4 p-3">
									<div>
										<div className="font-medium">{title}</div>
										<div className="text-xs text-muted-foreground">
											{new Date(e.starts_at).toLocaleString(locale === 'kk' ? 'kk-KZ' : 'ru-RU')}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant={e.status === 'published' ? 'default' : 'secondary'}>
											{e.status}
										</Badge>
										<AdminEventActions eventId={e.id} />
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>
		</div>
	);
}
