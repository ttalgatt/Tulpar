-- =============================================================================
-- 20260101001200_add_missing_settlements.sql
-- Населённые пункты, отсутствующие в namaztimes.kz API
-- Талапкер и другие сёла Целиноградского района рядом с Астаной
-- =============================================================================

-- Сёла Целиноградского района Акмолинской области (пригородная зона Астаны)
-- Добавляются под регион astana для удобства пользователей из агломерации
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('talapker', 'Талапкер', 'Талапкер', 'astana'),
  ('kosshy', 'Косшы', 'Қосшы', 'astana'),
  ('aksu-astana', 'Ақсу (Астана обл)', 'Ақсу', 'astana'),
  ('zerendi-astana', 'Зерінді', 'Зерінді', 'astana'),
  ('kargaly-astana', 'Қарғалы', 'Қарғалы', 'astana')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;
