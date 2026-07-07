'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	fullName: z.string().min(1).max(120),
});

const resetSchema = z.object({
	email: z.string().email(),
});

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signInAction(formData: FormData): Promise<AuthResult> {
	const parsed = signInSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	});
	if (!parsed.success) {
		const t = await getTranslations('auth');
		return { ok: false, error: t('invalidCredentials') };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword(parsed.data);
	if (error) {
		const t = await getTranslations('auth');
		return { ok: false, error: t('invalidCredentials') };
	}

	revalidatePath('/', 'layout');
	const locale = await getLocale();
	redirect({ href: '/', locale });
	return { ok: true };
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
	const t = await getTranslations('auth');
	const parsed = signUpSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
		fullName: formData.get('fullName'),
	});
	if (!parsed.success) {
		const msg = parsed.error.issues.find((i) => i.path[0] === 'password')
			? t('weakPassword')
			: t('invalidCredentials');
		return { ok: false, error: msg };
	}

	const supabase = await createClient();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
	const { data, error } = await supabase.auth.signUp({
		email: parsed.data.email,
		password: parsed.data.password,
		options: {
			data: { full_name: parsed.data.fullName },
			emailRedirectTo: `${siteUrl}/auth/callback`,
		},
	});
	if (error) {
		if (error.message.toLowerCase().includes('registered')) {
			return { ok: false, error: t('emailTaken') };
		}
		return { ok: false, error: error.message };
	}
	// Supabase с включённым Confirm email при дубле не возвращает ошибку,
	// но user.identities будет пустым массивом
	if (data.user && data.user.identities?.length === 0) {
		return { ok: false, error: t('emailTaken') };
	}

	revalidatePath('/', 'layout');
	return { ok: true };
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
	const parsed = resetSchema.safeParse({ email: formData.get('email') });
	if (!parsed.success) {
		const t = await getTranslations('auth');
		return { ok: false, error: t('invalidCredentials') };
	}
	const supabase = await createClient();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
	const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
		redirectTo: `${siteUrl}/auth/callback?next=/profile`,
	});
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function signOutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath('/', 'layout');
	const locale = await getLocale();
	redirect({ href: '/', locale });
}
