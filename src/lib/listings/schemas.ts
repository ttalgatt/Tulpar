import { z } from 'zod';

export const dealTypeSchema = z.enum(['sale', 'gift', 'exchange']);
export const unitSchema = z.enum(['piece', 'head', 'kg']);
export const statusSchema = z.enum(['draft', 'pending', 'published', 'archived', 'rejected']);

export const listingInputSchema = z
	.object({
		categoryId: z.coerce.number().int().positive(),
		regionId: z.coerce.number().int().positive().nullable().optional(),
		cityId: z.coerce.number().int().positive().nullable().optional(),
		districtId: z.coerce.number().int().positive().nullable().optional(),
		title: z.string().trim().min(1, 'Заголовок обязателен').max(200),
		description: z.string().trim().max(5000).optional().default(''),
		price: z
			.union([z.coerce.number().nonnegative().max(1e10), z.literal('').transform(() => null)])
			.nullable()
			.optional(),
		currency: z.string().length(3).default('KZT'),
		dealType: dealTypeSchema.default('sale'),
		quantity: z.coerce.number().int().positive().nullable().optional(),
		unit: unitSchema.nullable().optional(),
		isBulk: z.coerce.boolean().default(false),
		ageMonths: z.coerce.number().int().nonnegative().nullable().optional(),
		contactPhone: z.string().trim().max(18).optional().default(''),
		photos: z
			.array(
				z.object({
					path: z.string().min(1),
					orderIndex: z.coerce.number().int().min(0).default(0),
				}),
			)
			.max(20)
			.default([]),
	});

export type ListingInput = z.infer<typeof listingInputSchema>;

export const listingFiltersSchema = z.object({
	q: z.string().trim().max(120).optional(),
	kind: z.enum(['pets', 'livestock', 'goods', 'services']).optional(),
	categoryId: z.coerce.number().int().positive().optional(),
	regionId: z.coerce.number().int().positive().optional(),
	cityId: z.coerce.number().int().positive().optional(),
	districtId: z.coerce.number().int().positive().optional(),
	priceMin: z.coerce.number().nonnegative().optional(),
	priceMax: z.coerce.number().nonnegative().optional(),
	ageMin: z.coerce.number().int().nonnegative().optional(),
	ageMax: z.coerce.number().int().nonnegative().optional(),
	dealType: dealTypeSchema.optional(),
	withPhoto: z.coerce.boolean().optional(),
	isBulk: z.coerce.boolean().optional(),
	sort: z.enum(['newest', 'priceAsc', 'priceDesc']).default('newest'),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(48).default(24),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
