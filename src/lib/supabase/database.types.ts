/**
 * Database types.
 *
 * Полностью сгенерированные типы лежат в `database.types.generated.ts`
 * (получены из проекта ottlhzczdzwgqmmoubmc через `supabase gen types typescript --linked`).
 *
 * Однако сгенерированный `Database` использует `PostgrestVersion: "14.5"`,
 * который пока несовместим с инференцией select-string в установленном
 * `@supabase/postgrest-js@2.106.2` — все `.from(...).select(...)` начинают
 * резолвиться в `never`. Рантайм при этом работает корректно.
 *
 * Решения на будущее (TODO):
 *   1. Обновить `@supabase/supabase-js` и `@supabase/ssr` до версий, которые
 *      понимают `PostgrestVersion: "14.5"`, и переключить экспорт ниже
 *      на `from './database.types.generated'`.
 *   2. Либо вручную удалить `__InternalSupabase` из generated-файла и
 *      переключиться на него.
 *
 * Пока что используется `any`, чтобы каркас собирался и работал. Полезные
 * domain-типы (статусы и enum'ы) экспортируются явно ниже — на них опирается
 * прикладной код.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ListingStatus = 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
export type DealType = 'sale' | 'gift' | 'exchange';
export type ListingUnit = 'piece' | 'head' | 'kg';
export type CategoryKind = 'pets' | 'livestock' | 'goods' | 'services' | 'events';
export type UserRole = 'admin' | 'moderator';
export type EventStatus = 'draft' | 'published' | 'archived';
export type ReportStatus = 'open' | 'in_review' | 'resolved' | 'rejected';
export type ReportTargetType = 'listing' | 'user' | 'event';

// eslint-disable-next-line
export type Database = any;
