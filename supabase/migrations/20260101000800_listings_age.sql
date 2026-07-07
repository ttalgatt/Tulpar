-- =============================================================================
-- 20260101000800_listings_age.sql
-- Добавляет поле age_months в таблицу listings для хранения возраста животного
-- или техники (в месяцах). NULL = возраст не указан.
-- =============================================================================

alter table public.listings
  add column if not exists age_months integer check (age_months is null or age_months >= 0);

create index if not exists listings_age_idx on public.listings (age_months);
