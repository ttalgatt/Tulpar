import { cache } from 'react';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export type CatalogCategory = {
	id: number;
	slug: string;
	kind: string;
	name_ru: string;
	name_kk: string;
};

export type CatalogRegion = {
	id: number;
	slug: string;
	name_ru: string;
	name_kk: string;
};

export type CatalogCity = {
	id: number;
	region_id: number;
	slug: string;
	name_ru: string;
	name_kk: string;
};

export type CatalogResolve =
	| { level: 'category'; category: CatalogCategory }
	| { level: 'region'; category: CatalogCategory; region: CatalogRegion }
	| {
			level: 'city';
			category: CatalogCategory;
			region: CatalogRegion;
			city: CatalogCity;
	  };

export type CatalogSitemapEntry = {
	path: string;
	lastModified?: Date;
};

export function catalogPath(parts: {
	categorySlug: string;
	regionSlug?: string;
	citySlug?: string;
}): string {
	const { categorySlug, regionSlug, citySlug } = parts;
	if (regionSlug && citySlug) {
		return `/catalog/${regionSlug}/${citySlug}/${categorySlug}`;
	}
	if (regionSlug) {
		return `/catalog/${regionSlug}/${categorySlug}`;
	}
	return `/catalog/${categorySlug}`;
}

export function localeCatalogUrl(locale: string, path: string): string {
	const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buzau.kz';
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return locale === 'kk' ? `${base}/kk${normalized}` : `${base}${normalized}`;
}

export const resolveCategory = cache(async (slug: string): Promise<CatalogCategory | null> => {
	const supabase = await createClient();
	const { data } = await supabase
		.from('categories')
		.select('id, slug, kind, name_ru, name_kk')
		.eq('slug', slug)
		.maybeSingle();
	return data ?? null;
});

export const resolveRegion = cache(async (slug: string): Promise<CatalogRegion | null> => {
	const supabase = await createClient();
	const { data } = await supabase
		.from('regions')
		.select('id, slug, name_ru, name_kk')
		.eq('slug', slug)
		.maybeSingle();
	return data ?? null;
});

export const resolveCity = cache(
	async (regionId: number, citySlug: string): Promise<CatalogCity | null> => {
		const supabase = await createClient();
		const { data } = await supabase
			.from('cities')
			.select('id, region_id, slug, name_ru, name_kk')
			.eq('region_id', regionId)
			.eq('slug', citySlug)
			.maybeSingle();
		return data ?? null;
	},
);

/** Resolve /catalog/... segments into category ± region ± city. */
export const resolveCatalogSegments = cache(
	async (segments: string[]): Promise<CatalogResolve | null> => {
		if (segments.length === 1) {
			const category = await resolveCategory(segments[0]!);
			if (!category) return null;
			return { level: 'category', category };
		}

		if (segments.length === 2) {
			const [regionSlug, categorySlug] = segments;
			const [region, category] = await Promise.all([
				resolveRegion(regionSlug!),
				resolveCategory(categorySlug!),
			]);
			if (!region || !category) return null;
			return { level: 'region', category, region };
		}

		if (segments.length === 3) {
			const [regionSlug, citySlug, categorySlug] = segments;
			const [region, category] = await Promise.all([
				resolveRegion(regionSlug!),
				resolveCategory(categorySlug!),
			]);
			if (!region || !category) return null;
			const city = await resolveCity(region.id, citySlug!);
			if (!city) return null;
			return { level: 'city', category, region, city };
		}

		return null;
	},
);

export function catalogFiltersFromResolve(resolved: CatalogResolve): {
	categoryId: number;
	regionId?: number;
	cityId?: number;
} {
	if (resolved.level === 'category') {
		return { categoryId: resolved.category.id };
	}
	if (resolved.level === 'region') {
		return { categoryId: resolved.category.id, regionId: resolved.region.id };
	}
	return {
		categoryId: resolved.category.id,
		regionId: resolved.region.id,
		cityId: resolved.city.id,
	};
}

export function catalogPathFromResolve(resolved: CatalogResolve): string {
	if (resolved.level === 'category') {
		return catalogPath({ categorySlug: resolved.category.slug });
	}
	if (resolved.level === 'region') {
		return catalogPath({
			categorySlug: resolved.category.slug,
			regionSlug: resolved.region.slug,
		});
	}
	return catalogPath({
		categorySlug: resolved.category.slug,
		regionSlug: resolved.region.slug,
		citySlug: resolved.city.slug,
	});
}

/** Sibling categories for internal linking on the same location. */
export const fetchSiblingCategories = cache(async (excludeId: number): Promise<CatalogCategory[]> => {
	const supabase = await createClient();
	const { data } = await supabase
		.from('categories')
		.select('id, slug, kind, name_ru, name_kk')
		.neq('id', excludeId)
		.order('sort_order')
		.limit(12);
	return data ?? [];
});

/**
 * Catalog URLs that have ≥1 published listing (for sitemap).
 * Builds category-only, region+category, and city+category paths.
 */
export async function fetchCatalogSitemapEntries(): Promise<CatalogSitemapEntry[]> {
	const supabase = createServiceRoleClient();
	const { data, error } = await supabase
		.from('listings')
		.select('category_id, region_id, city_id, updated_at, categories(slug), regions(slug), cities(slug)')
		.eq('status', 'published')
		.not('category_id', 'is', null)
		.limit(10000);

	if (error || !data) return [];

	const categoryPaths = new Map<string, Date>();
	const regionPaths = new Map<string, Date>();
	const cityPaths = new Map<string, Date>();

	for (const row of data) {
		const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
		const region = Array.isArray(row.regions) ? row.regions[0] : row.regions;
		const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
		const categorySlug = cat?.slug as string | undefined;
		if (!categorySlug) continue;

		const updated = row.updated_at ? new Date(row.updated_at as string) : new Date();

		const catPath = catalogPath({ categorySlug });
		const prevCat = categoryPaths.get(catPath);
		if (!prevCat || updated > prevCat) categoryPaths.set(catPath, updated);

		const regionSlug = region?.slug as string | undefined;
		if (regionSlug) {
			const rPath = catalogPath({ categorySlug, regionSlug });
			const prevR = regionPaths.get(rPath);
			if (!prevR || updated > prevR) regionPaths.set(rPath, updated);
		}

		const citySlug = city?.slug as string | undefined;
		if (regionSlug && citySlug) {
			const cPath = catalogPath({ categorySlug, regionSlug, citySlug });
			const prevC = cityPaths.get(cPath);
			if (!prevC || updated > prevC) cityPaths.set(cPath, updated);
		}
	}

	const entries: CatalogSitemapEntry[] = [];
	for (const [path, lastModified] of categoryPaths) {
		entries.push({ path, lastModified });
	}
	for (const [path, lastModified] of regionPaths) {
		entries.push({ path, lastModified });
	}
	for (const [path, lastModified] of cityPaths) {
		entries.push({ path, lastModified });
	}
	return entries;
}
