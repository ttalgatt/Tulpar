import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export interface CurrentUser {
	id: string;
	email: string | null;
	fullName: string | null;
	avatarUrl: string | null;
	phone: string | null;
	roles: Array<'admin' | 'moderator'>;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const [{ data: profile }, { data: roles }] = await Promise.all([
		supabase
			.from('profiles')
			.select('full_name, avatar_url, phone')
			.eq('id', user.id)
			.maybeSingle(),
		supabase.from('user_roles').select('role').eq('user_id', user.id),
	]);

	return {
		id: user.id,
		email: user.email ?? null,
		fullName: profile?.full_name ?? null,
		avatarUrl: profile?.avatar_url ?? null,
		phone: profile?.phone ?? null,
		roles: (roles ?? []).map((r) => r.role as 'admin' | 'moderator'),
	};
});

export function isModerator(user: CurrentUser | null): boolean {
	if (!user) return false;
	return user.roles.includes('admin') || user.roles.includes('moderator');
}

export function isAdmin(user: CurrentUser | null): boolean {
	if (!user) return false;
	return user.roles.includes('admin');
}
