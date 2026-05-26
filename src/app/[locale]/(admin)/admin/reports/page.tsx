import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportActions } from '@/components/admin/report-actions';
import { formatRelativeDate } from '@/lib/utils';

export default async function ReportsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('admin');
	const supabase = await createClient();
	const { data: reports } = await supabase
		.from('reports')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(100);

	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';

	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">{t('reports')}</h2>
			{!reports || reports.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						Жалоб нет
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{reports.map((r) => (
						<Card key={r.id}>
							<CardContent className="space-y-2 p-4">
								<div className="flex items-center gap-2">
									<Badge variant={r.status === 'open' ? 'destructive' : 'outline'}>
										{r.status}
									</Badge>
									<Badge variant="secondary">{r.target_type}</Badge>
									<span className="text-xs text-muted-foreground">
										{formatRelativeDate(r.created_at, localeTag)}
									</span>
								</div>
								<div className="font-medium">{r.reason}</div>
								{r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
								<div className="text-xs text-muted-foreground">
									Target: {r.target_type} #{r.target_id}
								</div>
								{r.status === 'open' && <ReportActions reportId={r.id} />}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
