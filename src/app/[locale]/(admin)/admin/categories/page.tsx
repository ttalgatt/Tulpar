import { redirect } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { fetchCategories } from '@/lib/listings/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminCategoriesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!isAdmin(user)) redirect({ href: '/admin', locale });

	const categories = await fetchCategories();
	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const grouped = new Map<string, typeof categories>();
	for (const c of categories) {
		const arr = grouped.get(c.kind) ?? [];
		arr.push(c);
		grouped.set(c.kind, arr);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Категории</h2>
			<p className="text-sm text-muted-foreground">
				Полное редактирование выполняется через Supabase Studio (таблица <code>categories</code>).
				Здесь — обзор текущей структуры.
			</p>
			{Array.from(grouped.entries()).map(([kind, items]) => (
				<Card key={kind}>
					<CardContent className="p-4">
						<div className="mb-3 flex items-center gap-2">
							<Badge>{kind}</Badge>
							<span className="text-sm text-muted-foreground">({items.length})</span>
						</div>
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{items.map((c) => (
								<div key={c.id} className="rounded border px-3 py-2 text-sm">
									{c[localeKey]}{' '}
									<span className="text-xs text-muted-foreground">/ {c.slug}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
