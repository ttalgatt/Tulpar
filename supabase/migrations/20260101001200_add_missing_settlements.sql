-- =============================================================================
-- 20260101001200_add_missing_settlements.sql
-- Населённые пункты, отсутствующие в namaztimes.kz API:
--   1. Пригородная зона Астаны (под регион astana)
--   2. Область Абай (создана в 2022, нет в namaztimes)
--   3. Жетысуская область (создана в 2022, нет в namaztimes)
--   4. Улытауская область (создана в 2022, нет в namaztimes)
-- =============================================================================

-- ─────────────────────────────────────────────────────────
-- 1. Пригородная зона Астаны (Целиноградский район)
-- ─────────────────────────────────────────────────────────
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('talapker',      'Талапкер',         'Талапкер',        'astana'),
  ('kosshy',        'Косшы',            'Қосшы',           'astana'),
  ('aksu-astana',   'Ақсу',             'Ақсу',            'astana'),
  ('kargaly-astana','Қарғалы',          'Қарғалы',         'astana'),
  ('zerendi-astana','Зерінді',          'Зерінді',         'astana'),
  ('otemis',        'Өтеміс',           'Өтеміс',          'astana'),
  ('shamalgan-astana','Шамалған',       'Шамалған',        'astana')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- ─────────────────────────────────────────────────────────
-- 2. Область Абай (выделена из ВКО в 2022)
-- ─────────────────────────────────────────────────────────
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('ayagoz',    'Аягоз',     'Аягөз',     'abay'),
  ('zaysan',    'Зайсан',    'Зайсан',    'abay'),
  ('kurchatov', 'Курчатов',  'Курчатов',  'abay'),
  ('shar',      'Шар',       'Шар',       'abay'),
  ('urzhar',    'Үржар',     'Үржар',     'abay'),
  ('karaul',    'Қарауыл',   'Қарауыл',   'abay')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- ─────────────────────────────────────────────────────────
-- 3. Жетысуская область (выделена из Алматинской в 2022)
-- ─────────────────────────────────────────────────────────
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('taldykorgan-zhetisu-2', 'Талдыкорган', 'Талдықорған', 'zhetisu'),
  ('tekeli-zhetisu',        'Текели',      'Текелі',      'zhetisu'),
  ('zharkent-zhetisu',      'Жаркент',     'Жаркент',     'zhetisu'),
  ('sarkand-zhetisu',       'Сарканд',     'Сарқанд',     'zhetisu'),
  ('ushtobe-zhetisu',       'Үштөбе',      'Үштөбе',      'zhetisu'),
  ('karakol-zhetisu',       'Қаракөл',     'Қаракөл',     'zhetisu'),
  ('kegen-zhetisu',         'Кеген',       'Кеген',       'zhetisu'),
  ('chundzha-zhetisu',      'Чунджа',      'Чунджа',      'zhetisu')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- ─────────────────────────────────────────────────────────
-- 4. Улытауская область (выделена из Карагандинской в 2022)
-- ─────────────────────────────────────────────────────────
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('satpaev',  'Сатпаев',  'Сәтпаев',  'ulytau'),
  ('balqash',  'Балқаш',   'Балқаш',   'ulytau'),
  ('ulytau',   'Үлытау',   'Үлытау',   'ulytau'),
  ('zhanaarka','Жаңаарқа', 'Жаңаарқа', 'ulytau')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;
