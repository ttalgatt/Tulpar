export const CATEGORY_KIND_ORDER = ['livestock', 'pets', 'goods', 'services'] as const;

export type ListingCategoryKind = (typeof CATEGORY_KIND_ORDER)[number];

export function sortCategoriesByWizardOrder<T extends { kind: string }>(categories: T[]): T[] {
	return categories.slice().sort((a, b) => {
		const ai = CATEGORY_KIND_ORDER.indexOf(a.kind as ListingCategoryKind);
		const bi = CATEGORY_KIND_ORDER.indexOf(b.kind as ListingCategoryKind);
		const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
		const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
		return aRank - bRank;
	});
}
