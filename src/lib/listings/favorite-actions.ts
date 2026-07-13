'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type FavToggleResult = { ok: true; data: boolean } | { ok: false; error: string };

export async function toggleFavoriteAction(listingId: string): Promise<FavToggleResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const { data: existing } = await supabase
		.from('favorites')
		.select('listing_id')
		.eq('user_id', user.id)
		.eq('listing_id', listingId)
		.maybeSingle();

	if (existing) {
		const { error } = await supabase
			.from('favorites')
			.delete()
			.eq('user_id', user.id)
			.eq('listing_id', listingId);
		if (error) return { ok: false, error: error.message };
		revalidatePath('/my/favorites');
		return { ok: true, data: false };
	}

	const { error } = await supabase
		.from('favorites')
		.insert({ user_id: user.id, listing_id: listingId });
	if (error) return { ok: false, error: error.message };
	revalidatePath('/my/favorites');
	return { ok: true, data: true };
}
