'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, isModerator, isAdmin } from '@/lib/auth';

export type AdminResult = { ok: true } | { ok: false; error: string };

async function ensureModerator() {
	const user = await getCurrentUser();
	if (!isModerator(user)) throw new Error('Forbidden');
	return user!;
}

async function ensureAdmin() {
	const user = await getCurrentUser();
	if (!isAdmin(user)) throw new Error('Forbidden');
	return user!;
}

export async function approveListingAction(listingId: string): Promise<AdminResult> {
	try {
		await ensureModerator();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const supabase = await createClient();
	const { error } = await supabase
		.from('listings')
		.update({ status: 'published', rejection_reason: null })
		.eq('id', listingId);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/moderation');
	revalidatePath(`/listings/${listingId}`);
	revalidatePath('/listings');
	return { ok: true };
}

export async function rejectListingAction(
	listingId: string,
	reason: string,
): Promise<AdminResult> {
	try {
		await ensureModerator();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const parsed = z.string().min(1).max(1000).safeParse(reason);
	if (!parsed.success) return { ok: false, error: 'Invalid reason' };

	const supabase = await createClient();
	const { error } = await supabase
		.from('listings')
		.update({ status: 'rejected', rejection_reason: parsed.data })
		.eq('id', listingId);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/moderation');
	return { ok: true };
}

export async function resolveReportAction(
	reportId: string,
	action: 'resolved' | 'rejected',
): Promise<AdminResult> {
	try {
		await ensureModerator();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const supabase = await createClient();
	const { error } = await supabase
		.from('reports')
		.update({ status: action, resolved_at: new Date().toISOString() })
		.eq('id', reportId);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/reports');
	return { ok: true };
}

const eventSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(5000).optional().default(''),
	startsAt: z.string().min(1),
	endsAt: z.string().optional().default(''),
	cityId: z.coerce.number().int().positive().optional().nullable(),
	address: z.string().max(300).optional().default(''),
	organizer: z.string().max(200).optional().default(''),
	coverPath: z.string().optional().default(''),
	publish: z.coerce.boolean().default(false),
});

export type EventInput = z.input<typeof eventSchema>;

export async function createEventAction(input: EventInput): Promise<AdminResult & { id?: string }> {
	let user;
	try {
		user = await ensureModerator();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const parsed = eventSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
	}
	const data = parsed.data;

	const supabase = await createClient();
	const { data: row, error } = await supabase
		.from('events')
		.insert({
			title: data.title,
			description: data.description || null,
			starts_at: data.startsAt,
			ends_at: data.endsAt || null,
			city_id: data.cityId ?? null,
			address: data.address || null,
			organizer: data.organizer || null,
			cover_path: data.coverPath || null,
			status: data.publish ? 'published' : 'draft',
			created_by: user.id,
		})
		.select('id')
		.single();
	if (error || !row) return { ok: false, error: error?.message ?? 'Unknown' };

	revalidatePath('/admin/events');
	revalidatePath('/events');
	return { ok: true, id: row.id };
}

export async function deleteEventAction(eventId: string): Promise<AdminResult> {
	try {
		await ensureModerator();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const supabase = await createClient();
	const { error } = await supabase.from('events').delete().eq('id', eventId);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/events');
	revalidatePath('/events');
	return { ok: true };
}

export async function grantRoleAction(
	userId: string,
	role: 'admin' | 'moderator',
): Promise<AdminResult> {
	try {
		await ensureAdmin();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const supabase = await createClient();
	const { error } = await supabase
		.from('user_roles')
		.upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/users');
	return { ok: true };
}

export async function revokeRoleAction(
	userId: string,
	role: 'admin' | 'moderator',
): Promise<AdminResult> {
	try {
		await ensureAdmin();
	} catch {
		return { ok: false, error: 'Forbidden' };
	}
	const supabase = await createClient();
	const { error } = await supabase
		.from('user_roles')
		.delete()
		.eq('user_id', userId)
		.eq('role', role);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/admin/users');
	return { ok: true };
}
