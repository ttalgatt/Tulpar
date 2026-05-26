import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

export default async function AdminDashboardPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const supabase = await createClient();

	const [pending, published, openReports, profiles] = await Promise.all([
		supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
		supabase
			.from('listings')
			.select('id', { count: 'exact', head: true })
			.eq('status', 'published'),
		supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
		supabase.from('profiles').select('id', { count: 'exact', head: true }),
	]);

	const stats = [
		{ label: 'На модерации', value: pending.count ?? 0 },
		{ label: 'Опубликовано', value: published.count ?? 0 },
		{ label: 'Открытых жалоб', value: openReports.count ?? 0 },
		{ label: 'Пользователей', value: profiles.count ?? 0 },
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((s) => (
				<Card key={s.label}>
					<CardContent className="p-6">
						<div className="text-sm text-muted-foreground">{s.label}</div>
						<div className="mt-2 text-3xl font-bold">{s.value}</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
