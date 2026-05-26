/**
 * Database types — гибкая заглушка.
 * После применения миграций выполните `pnpm db:types`, чтобы перезаписать
 * этот файл точными типами, сгенерированными из Supabase.
 *
 * До генерации используется минимальная форма, при которой supabase-js
 * не выводит ограничений (`.select(...)` возвращает `unknown`-совместимый тип).
 */

// Используется тип `any` — supabase-js откатывается на нестрогую инференцию.
// Замените после генерации актуальных типов из Supabase.
// eslint-disable-next-line
export type Database = any;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ListingStatus = 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
export type DealType = 'sale' | 'gift' | 'exchange';
export type ListingUnit = 'piece' | 'head' | 'kg';
export type CategoryKind = 'pets' | 'livestock' | 'goods' | 'services' | 'events';
export type UserRole = 'admin' | 'moderator';
export type EventStatus = 'draft' | 'published' | 'archived';
export type ReportStatus = 'open' | 'in_review' | 'resolved' | 'rejected';
export type ReportTargetType = 'listing' | 'user' | 'event';

// ---------------------------------------------------------------------------
// Ниже — типы для возможной строгой генерации.
// Не используются, пока Database = any, но оставлены как ориентир.
// ---------------------------------------------------------------------------

type TableDef<R extends Record<string, unknown>> = {
	Row: R;
	Insert: Partial<R>;
	Update: Partial<R>;
	Relationships: [];
};

export type DatabaseStrict = {
	public: {
		Tables: {
			profiles: TableDef<{
				id: string;
				full_name: string | null;
				phone: string | null;
				avatar_url: string | null;
				created_at: string;
				updated_at: string;
			}>;
			regions: TableDef<{
				id: number;
				slug: string;
				name_ru: string;
				name_kk: string;
			}>;
			cities: TableDef<{
				id: number;
				region_id: number;
				slug: string;
				name_ru: string;
				name_kk: string;
			}>;
			districts: TableDef<{
				id: number;
				city_id: number;
				slug: string;
				name_ru: string;
				name_kk: string;
			}>;
			categories: TableDef<{
				id: number;
				parent_id: number | null;
				slug: string;
				kind: CategoryKind;
				name_ru: string;
				name_kk: string;
				icon: string | null;
				sort_order: number;
			}>;
			listings: TableDef<{
				id: string;
				owner_id: string;
				category_id: number;
				region_id: number | null;
				city_id: number | null;
				district_id: number | null;
				title_ru: string | null;
				title_kk: string | null;
				description_ru: string | null;
				description_kk: string | null;
				price: number | null;
				currency: string;
				deal_type: DealType;
				quantity: number | null;
				unit: ListingUnit | null;
				is_bulk: boolean;
				status: ListingStatus;
				is_featured: boolean;
				promoted_until: string | null;
				views_count: number;
				rejection_reason: string | null;
				expires_at: string | null;
				created_at: string;
				updated_at: string;
			}>;
			listing_photos: TableDef<{
				id: string;
				listing_id: string;
				path: string;
				order_index: number;
				created_at: string;
			}>;
			listing_attributes: TableDef<{
				listing_id: string;
				attribute_key: string;
				value_text: string | null;
				value_num: number | null;
				value_bool: boolean | null;
			}>;
			favorites: TableDef<{
				user_id: string;
				listing_id: string;
				created_at: string;
			}>;
			events: TableDef<{
				id: string;
				title_ru: string;
				title_kk: string | null;
				description_ru: string | null;
				description_kk: string | null;
				starts_at: string;
				ends_at: string | null;
				city_id: number | null;
				address: string | null;
				organizer: string | null;
				cover_path: string | null;
				status: EventStatus;
				created_by: string | null;
				created_at: string;
			}>;
			user_roles: TableDef<{
				user_id: string;
				role: UserRole;
				granted_at: string;
			}>;
			reports: TableDef<{
				id: string;
				target_type: ReportTargetType;
				target_id: string;
				reporter_id: string;
				reason: string;
				comment: string | null;
				status: ReportStatus;
				created_at: string;
				resolved_at: string | null;
			}>;
		};
		Views: Record<string, never>;
		Functions: {
			increment_listing_views: {
				Args: { p_listing_id: string };
				Returns: undefined;
			};
			is_admin: {
				Args: Record<string, never>;
				Returns: boolean;
			};
			is_moderator: {
				Args: Record<string, never>;
				Returns: boolean;
			};
		};
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
