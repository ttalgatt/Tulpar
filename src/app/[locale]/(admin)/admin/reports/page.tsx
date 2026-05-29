import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportActions } from '@/components/admin/report-actions';
import { formatRelativeDate } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { ExternalLink } from 'lucide-react';

const REASON_LABELS: Record<string, string> = {
	spam: 'Спам',
	fraud: 'Мошенничество',
	prohibited: 'Запрещённый товар',
	wrong_category: 'Неверная категория',
	duplicate: 'Дубликат',
	other: 'Другое',
};

export default async function ReportsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('admin');
	const tListing = await getTranslations('listings.detail');
	const supabase = createServiceRoleClient();

	const { data: reports } = await supabase
		.from('reports')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(100);

	// Fetch listing titles for listing-type reports
	const listingIds = [
		...new Set(
			(reports ?? [])
				.filter((r) => r.target_type === 'listing')
				.map((r) => r.target_id),
		),
	];
	const listingTitleMap: Record<string, string> = {};
	if (listingIds.length > 0) {
		const { data: listings } = await supabase
			.from('listings')
			.select('id, title')
			.in('id', listingIds);
		(listings ?? []).forEach((l) => {
			listingTitleMap[l.id] = l.title || l.id;
		});
	}

	const localeTag = locale === 'kk' ? 'kk-KZ' : 'ru-RU';

	const statusVariant = (s: string) => {
		if (s === 'open') return 'destructive' as const;
		if (s === 'in_review') return 'accent' as const;
		return 'outline' as const;
	};

	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">{t('reports')}</h2>
			{!reports || reports.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						{t('noReports')}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{reports.map((r) => {
						const listingTitle =
							r.target_type === 'listing' ? listingTitleMap[r.target_id] : null;
						const reasonLabel = REASON_LABELS[r.reason] ?? r.reason;
						const statusLabel =
							t.rich(`reportStatuses.${r.status}`, {}) ?? r.status;

						return (
							<Card key={r.id}>
								<CardContent className="space-y-2 p-4">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant={statusVariant(r.status)}>
											{String(statusLabel)}
										</Badge>
										<Badge variant="secondary">
											{t(`reportTargets.${r.target_type}`)}
										</Badge>
										<span className="text-xs text-muted-foreground">
											{formatRelativeDate(r.created_at, localeTag)}
										</span>
									</div>

									<div className="font-medium">{reasonLabel}</div>

									{listingTitle && (
										<Link
											href={`/listings/${r.target_id}`}
											className="flex items-center gap-1 text-sm text-primary hover:underline"
											target="_blank"
										>
											{listingTitle}
											<ExternalLink className="h-3 w-3" />
										</Link>
									)}

									{!listingTitle && (
										<div className="font-mono text-xs text-muted-foreground">
											{r.target_id}
										</div>
									)}

									{r.comment && (
										<p className="text-sm text-muted-foreground">{r.comment}</p>
									)}

									{r.status === 'open' && <ReportActions reportId={r.id} />}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
