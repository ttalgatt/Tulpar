-- =============================================================================
-- 20260101001400_dedupe_cities.sql
-- Убираем сельские администрации (а.Талапкер) и одноимённые НП в одной области
-- =============================================================================

begin;

create or replace function pg_temp.city_dedupe_key(t text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    translate(
      lower(regexp_replace(coalesce(t, ''), '^а\.\s*', '', 'i')),
      'ёәғқңөұүһі',
      'еагкноуухи'
    ),
    '[^a-zа-я0-9]+',
    '',
    'g'
  );
$$;

-- Какой id оставляем в каждой группе (region + нормализованное имя)
create temporary table city_keep (
  keep_id integer primary key,
  region_id smallint not null,
  dedupe_key text not null
) on commit drop;

insert into city_keep (keep_id, region_id, dedupe_key)
select distinct on (c.region_id, pg_temp.city_dedupe_key(c.name_ru))
  c.id,
  c.region_id,
  pg_temp.city_dedupe_key(c.name_ru)
from public.cities c
order by
  c.region_id,
  pg_temp.city_dedupe_key(c.name_ru),
  (c.name_ru ~* '^а\.')::int asc,
  (c.kato_code ~ '(00|100)$')::int desc,
  c.kato_code asc;

create temporary table city_drop (
  drop_id integer primary key,
  keep_id integer not null
) on commit drop;

insert into city_drop (drop_id, keep_id)
select c.id, k.keep_id
from public.cities c
join city_keep k
  on k.region_id = c.region_id
 and k.dedupe_key = pg_temp.city_dedupe_key(c.name_ru)
where c.id <> k.keep_id;

-- Перепривязка контента
update public.listings l
set city_id = d.keep_id
from city_drop d
where l.city_id = d.drop_id;

update public.events e
set city_id = d.keep_id
from city_drop d
where e.city_id = d.drop_id;

-- Районы на удаляемых городах не ожидаются; на всякий случай обнулим через CASCADE/SET NULL
-- districts.city_id ON DELETE CASCADE — сначала перенесём, если вдруг есть
update public.districts dist
set city_id = d.keep_id
from city_drop d
where dist.city_id = d.drop_id
  and not exists (
    select 1 from public.districts x
    where x.city_id = d.keep_id and x.slug = dist.slug
  );

delete from public.districts dist
using city_drop d
where dist.city_id = d.drop_id;

delete from public.cities c
using city_drop d
where c.id = d.drop_id;

commit;
