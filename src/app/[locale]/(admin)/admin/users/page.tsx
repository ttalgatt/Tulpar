import { redirect } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { UserRoleManager } from '@/components/admin/user-role-manager';

export default async function UsersPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!isAdmin(user)) redirect({ href: '/admin', locale });

	const supabase = createServiceRoleClient();
	const [{ data: profiles }, { data: roles }] = await Promise.all([
		supabase
			.from('profiles')
			.select('id, full_name, phone, created_at')
			.order('created_at', { ascending: false })
			.limit(200),
		supabase.from('user_roles').select('user_id, role'),
	]);

	const rolesByUser = new Map<string, string[]>();
	for (const r of roles ?? []) {
		const list = rolesByUser.get(r.user_id) ?? [];
		list.push(r.role);
		rolesByUser.set(r.user_id, list);
	}

	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">Пользователи</h2>
			<div className="space-y-2">
				{(profiles ?? []).map((p) => (
					<Card key={p.id}>
						<CardContent className="flex items-center justify-between gap-4 p-3">
							<div className="min-w-0 flex-1">
								<div className="line-clamp-1 font-medium">{p.full_name || '(без имени)'}</div>
								<div className="text-xs text-muted-foreground">
									{p.phone ?? '—'} · {new Date(p.created_at).toLocaleDateString()}
								</div>
							</div>
							<UserRoleManager userId={p.id} roles={rolesByUser.get(p.id) ?? []} />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
