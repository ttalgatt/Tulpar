-- =============================================================================
-- 20260101000700_drop_bilingual_content.sql
-- Убираем двуязычность контента: одно поле title/description вместо *_ru/*_kk.
-- Переносим (объединяем) имеющиеся данные из *_kk в *_ru, переименовываем
-- title_ru -> title, description_ru -> description и удаляем колонки *_kk.
-- Затрагивает listings и events. Справочники (categories/regions/cities/...)
-- остаются двуязычными — это локализация интерфейса, а не контент.
-- =============================================================================

begin;

-- ── LISTINGS ────────────────────────────────────────────────────────────────

-- Backfill: объединяем русскую и казахскую версии перед удалением *_kk.
update public.listings
set
	title_ru = case
		when coalesce(nullif(btrim(title_ru), ''), '') = '' then nullif(btrim(title_kk), '')
		when coalesce(nullif(btrim(title_kk), ''), '') = '' then nullif(btrim(title_ru), '')
		when btrim(title_ru) = btrim(title_kk) then btrim(title_ru)
		else btrim(title_ru) || ' / ' || btrim(title_kk)
	end,
	description_ru = case
		when coalesce(nullif(btrim(description_ru), ''), '') = '' then nullif(btrim(description_kk), '')
		when coalesce(nullif(btrim(description_kk), ''), '') = '' then nullif(btrim(description_ru), '')
		when btrim(description_ru) = btrim(description_kk) then btrim(description_ru)
		else btrim(description_ru) || E'\n\n' || btrim(description_kk)
	end
where
	coalesce(nullif(btrim(title_kk), ''), '') <> ''
	or coalesce(nullif(btrim(description_kk), ''), '') <> '';

-- Снимаем зависимости от колонок, которые будем менять.
drop index if exists public.listings_search_idx;
drop index if exists public.listings_title_trgm_idx;
alter table public.listings drop constraint if exists listings_title_required;
alter table public.listings drop column if exists search_tsv;

-- Переименование и удаление двуязычных колонок.
alter table public.listings rename column title_ru to title;
alter table public.listings rename column description_ru to description;
alter table public.listings drop column if exists title_kk;
alter table public.listings drop column if exists description_kk;

-- Пересоздаём генерируемый tsvector, индексы и constraint поверх одного поля.
alter table public.listings
	add column search_tsv tsvector generated always as (
		setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
		setweight(to_tsvector('simple', coalesce(description, '')), 'B')
	) stored;

create index listings_search_idx on public.listings using gin (search_tsv);
create index listings_title_trgm_idx on public.listings using gin (coalesce(title, '') gin_trgm_ops);

alter table public.listings
	add constraint listings_title_required
	check (coalesce(length(trim(title)), 0) > 0);

-- ── EVENTS ──────────────────────────────────────────────────────────────────

update public.events
set
	title_ru = case
		when coalesce(nullif(btrim(title_ru), ''), '') = '' then nullif(btrim(title_kk), '')
		when coalesce(nullif(btrim(title_kk), ''), '') = '' then nullif(btrim(title_ru), '')
		when btrim(title_ru) = btrim(title_kk) then btrim(title_ru)
		else btrim(title_ru) || ' / ' || btrim(title_kk)
	end,
	description_ru = case
		when coalesce(nullif(btrim(description_ru), ''), '') = '' then nullif(btrim(description_kk), '')
		when coalesce(nullif(btrim(description_kk), ''), '') = '' then nullif(btrim(description_ru), '')
		when btrim(description_ru) = btrim(description_kk) then btrim(description_ru)
		else btrim(description_ru) || E'\n\n' || btrim(description_kk)
	end
where
	coalesce(nullif(btrim(title_kk), ''), '') <> ''
	or coalesce(nullif(btrim(description_kk), ''), '') <> '';

alter table public.events rename column title_ru to title;
alter table public.events rename column description_ru to description;
alter table public.events drop column if exists title_kk;
alter table public.events drop column if exists description_kk;

commit;
