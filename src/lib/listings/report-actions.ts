'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const reportSchema = z.object({
	listingId: z.string().uuid(),
	reason: z.enum(['spam', 'fraud', 'prohibited', 'wrong_category', 'duplicate', 'other']),
	comment: z.string().max(1000).optional(),
});

export type ReportResult = { ok: true } | { ok: false; error: string };

export async function createReportAction(
	_prev: unknown,
	formData: FormData,
): Promise<ReportResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Необходима авторизация' };

	const parsed = reportSchema.safeParse({
		listingId: formData.get('listingId'),
		reason: formData.get('reason'),
		comment: formData.get('comment') || undefined,
	});
	if (!parsed.success) return { ok: false, error: 'Некорректные данные' };

	const { error } = await supabase.from('reports').insert({
		target_type: 'listing',
		target_id: parsed.data.listingId,
		reporter_id: user.id,
		reason: parsed.data.reason,
		comment: parsed.data.comment ?? null,
	});

	if (error) {
		if (error.code === '23505') return { ok: false, error: 'Вы уже жаловались на это объявление' };
		return { ok: false, error: error.message };
	}
	return { ok: true };
}
