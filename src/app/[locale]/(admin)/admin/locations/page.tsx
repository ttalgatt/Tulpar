import { redirect } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminLocationsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!isAdmin(user)) redirect({ href: '/admin', locale });

	const supabase = await createClient();
	const [{ data: regions }, { data: cities }, { data: districts }] = await Promise.all([
		supabase.from('regions').select('*').order('name_ru'),
		supabase.from('cities').select('*').order('name_ru'),
		supabase.from('districts').select('*').order('name_ru'),
	]);

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Локации</h2>
			<p className="text-sm text-muted-foreground">
				Полное редактирование выполняется через Supabase Studio. Здесь — обзор справочников.
			</p>
			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardContent className="p-4">
						<Badge className="mb-2">Регионы</Badge>
						<div className="text-xs text-muted-foreground">({regions?.length ?? 0})</div>
						<ul className="mt-2 space-y-1 text-sm">
							{(regions ?? []).map((r) => (
								<li key={r.id}>{r[localeKey]}</li>
							))}
						</ul>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<Badge className="mb-2">Города</Badge>
						<div className="text-xs text-muted-foreground">({cities?.length ?? 0})</div>
						<ul className="mt-2 max-h-96 space-y-1 overflow-y-auto text-sm">
							{(cities ?? []).map((c) => (
								<li key={c.id}>{c[localeKey]}</li>
							))}
						</ul>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<Badge className="mb-2">Районы</Badge>
						<div className="text-xs text-muted-foreground">({districts?.length ?? 0})</div>
						<ul className="mt-2 max-h-96 space-y-1 overflow-y-auto text-sm">
							{(districts ?? []).map((d) => (
								<li key={d.id}>{d[localeKey]}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
