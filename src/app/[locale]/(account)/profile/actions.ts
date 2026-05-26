'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
	fullName: z.string().min(1).max(120),
	phone: z
		.string()
		.trim()
		.max(40)
		.optional()
		.transform((v) => (v && v.length > 0 ? v : null)),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
	const parsed = schema.safeParse({
		fullName: formData.get('fullName'),
		phone: formData.get('phone'),
	});
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const { error } = await supabase
		.from('profiles')
		.update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
		.eq('id', user.id);
	if (error) return { ok: false, error: error.message };

	revalidatePath('/profile');
	revalidatePath('/', 'layout');
	return { ok: true };
}
