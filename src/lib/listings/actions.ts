'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listingInputSchema, type ListingInput } from './schemas';

export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createListingAction(
	input: ListingInput,
	options: { publish?: boolean } = {},
): Promise<ActionResult<{ id: string }>> {
	const parsed = listingInputSchema.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			error: 'Validation error',
			fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}
	const data = parsed.data;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const status = options.publish ? 'pending' : 'draft';

	const { data: inserted, error } = await supabase
		.from('listings')
		.insert({
			owner_id: user.id,
			category_id: data.categoryId,
			region_id: data.regionId ?? null,
			city_id: data.cityId ?? null,
			district_id: data.districtId ?? null,
			title: data.title,
			description: data.description || null,
			price: data.price ?? null,
			currency: data.currency,
			deal_type: data.dealType,
			quantity: data.quantity ?? null,
			unit: data.unit ?? null,
			is_bulk: data.isBulk,
			age_months: data.ageMonths ?? null,
			contact_phone: data.contactPhone || null,
			status,
		})
		.select('id, slug')
		.single();

	if (error || !inserted) {
		return { ok: false, error: error?.message ?? 'Unknown error' };
	}

	if (data.photos.length > 0) {
		const rows = data.photos.map((p, idx) => ({
			listing_id: inserted.id,
			path: p.path,
			order_index: p.orderIndex ?? idx,
		}));
		await supabase.from('listing_photos').insert(rows);
	}

	revalidatePath('/listings');
	revalidatePath('/my/listings');
	return { ok: true, data: { id: inserted.id } };
}

export async function updateListingAction(
	id: string,
	input: ListingInput,
	options: { publish?: boolean } = {},
): Promise<ActionResult<{ id: string }>> {
	const parsed = listingInputSchema.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			error: 'Validation error',
			fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}
	const data = parsed.data;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const updates: Record<string, unknown> = {
		category_id: data.categoryId,
		region_id: data.regionId ?? null,
		city_id: data.cityId ?? null,
		district_id: data.districtId ?? null,
		title: data.title,
		description: data.description || null,
		price: data.price ?? null,
		currency: data.currency,
		deal_type: data.dealType,
		quantity: data.quantity ?? null,
		unit: data.unit ?? null,
		is_bulk: data.isBulk,
		age_months: data.ageMonths ?? null,
		contact_phone: data.contactPhone || null,
	};
	if (options.publish) updates.status = 'pending';

	const { error } = await supabase
		.from('listings')
		.update(updates)
		.eq('id', id)
		.eq('owner_id', user.id);

	if (error) return { ok: false, error: error.message };

	// Перезаписываем фото: удаляем все и вставляем заново
	await supabase.from('listing_photos').delete().eq('listing_id', id);
	if (data.photos.length > 0) {
		const rows = data.photos.map((p, idx) => ({
			listing_id: id,
			path: p.path,
			order_index: p.orderIndex ?? idx,
		}));
		await supabase.from('listing_photos').insert(rows);
	}

	revalidatePath('/listings');
	revalidatePath('/my/listings');
	revalidatePath(`/listings/${id}`);
	return { ok: true, data: { id } };
}

export async function archiveListingAction(id: string): Promise<ActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };
	const { error } = await supabase
		.from('listings')
		.update({ status: 'archived' })
		.eq('id', id)
		.eq('owner_id', user.id);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/my/listings');
	revalidatePath(`/listings/${id}`);
	return { ok: true, data: undefined };
}

export async function deleteListingAction(id: string): Promise<ActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };
	const { error } = await supabase.from('listings').delete().eq('id', id).eq('owner_id', user.id);
	if (error) return { ok: false, error: error.message };
	revalidatePath('/my/listings');
	return { ok: true, data: undefined };
}

export async function publishAfterCreateRedirect(id: string) {
	revalidatePath('/my/listings');
	const locale = await getLocale();
	redirect({ href: `/listings/${id}`, locale });
}
