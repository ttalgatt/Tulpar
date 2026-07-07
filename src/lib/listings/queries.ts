import { cache } from 'react';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { ListingFilters } from './schemas';

export interface ListingListItem {
	id: string;
	title: string | null;
	price: number | null;
	currency: string;
	deal_type: 'sale' | 'gift' | 'exchange';
	is_bulk: boolean;
	quantity: number | null;
	unit: 'piece' | 'head' | 'kg' | null;
	age_months: number | null;
	created_at: string;
	status: string;
	listing_photos: { path: string; order_index: number }[] | null;
}

export interface ListingsResult {
	items: ListingListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export const fetchListings = cache(async (filters: ListingFilters): Promise<ListingsResult> => {
	const supabase = await createClient();
	const from = (filters.page - 1) * filters.pageSize;
	const to = from + filters.pageSize - 1;

	let query = supabase
		.from('listings')
		.select(
			'id, title, price, currency, deal_type, is_bulk, quantity, unit, age_months, created_at, status, listing_photos(path, order_index)',
			{ count: 'exact' },
		)
		.eq('status', 'published');

	if (filters.q) {
		query = query.or(
			`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`,
		);
	}

	if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
	if (filters.regionId) query = query.eq('region_id', filters.regionId);
	if (filters.cityId) query = query.eq('city_id', filters.cityId);
	if (filters.districtId) query = query.eq('district_id', filters.districtId);
	if (filters.dealType) query = query.eq('deal_type', filters.dealType);
	if (filters.priceMin !== undefined) query = query.gte('price', filters.priceMin);
	if (filters.priceMax !== undefined) query = query.lte('price', filters.priceMax);
	if (filters.ageMin !== undefined) query = query.gte('age_months', filters.ageMin);
	if (filters.ageMax !== undefined) query = query.lte('age_months', filters.ageMax);

	if (filters.kind) {
		const { data: catIds } = await supabase
			.from('categories')
			.select('id')
			.eq('kind', filters.kind);
		const ids = (catIds ?? []).map((c) => c.id);
		if (ids.length > 0) query = query.in('category_id', ids);
	}

	switch (filters.sort) {
		case 'priceAsc':
			query = query.order('price', { ascending: true, nullsFirst: false });
			break;
		case 'priceDesc':
			query = query.order('price', { ascending: false, nullsFirst: false });
			break;
		default:
			query = query.order('created_at', { ascending: false });
	}

	const { data, count } = await query.range(from, to);

	const total = count ?? 0;
	return {
		items: (data ?? []) as ListingListItem[],
		total,
		page: filters.page,
		pageSize: filters.pageSize,
		totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
	};
});

// Uses service role to bypass RLS — authorization is enforced in the page
// (status=published OR owner OR moderator). This avoids auth.uid() being NULL
// in server components when the session cookie hasn't propagated through the
// RSC render pipeline yet.
export const fetchListing = cache(async (id: string) => {
	const supabase = createServiceRoleClient();
	const { data, error } = await supabase
		.from('listings')
		.select(
			`*,
			listing_photos(id, path, order_index),
			listing_attributes(attribute_key, value_text, value_num, value_bool),
			categories(id, slug, kind, name_ru, name_kk),
			regions(id, slug, name_ru, name_kk),
			cities(id, slug, name_ru, name_kk),
			districts(id, slug, name_ru, name_kk)`,
		)
		.eq('id', id)
		.maybeSingle();
	if (!data || error) return null;

	// Fetch seller profile separately to avoid PostgREST schema cache FK issues
	const { data: profile } = await supabase
		.from('profiles')
		.select('id, full_name, phone, avatar_url')
		.eq('id', data.owner_id)
		.maybeSingle();

	return { ...data, profiles: profile ?? null };
});

export const fetchCategories = cache(async () => {
	const supabase = await createClient();
	const { data } = await supabase.from('categories').select('*').order('sort_order');
	return data ?? [];
});

export const fetchRegions = cache(async () => {
	const supabase = await createClient();
	const { data } = await supabase.from('regions').select('*').order('name_ru');
	return data ?? [];
});

export const fetchCitiesByRegion = cache(async (regionId: number) => {
	const supabase = await createClient();
	const { data } = await supabase
		.from('cities')
		.select('*')
		.eq('region_id', regionId)
		.order('name_ru');
	return data ?? [];
});

export const fetchDistrictsByCity = cache(async (cityId: number) => {
	const supabase = await createClient();
	const { data } = await supabase
		.from('districts')
		.select('*')
		.eq('city_id', cityId)
		.order('name_ru');
	return data ?? [];
});
