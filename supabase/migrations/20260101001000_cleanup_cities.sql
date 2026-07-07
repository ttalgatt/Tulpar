-- =============================================================================
-- 20260101001000_cleanup_cities.sql
-- Удаляет дубли городов, добавленных первой версией миграции 000900:
--   • города-регионы (Астана, Алматы, Шымкент — у них есть своя region)
--   • города, уже существующие в seed.sql с другим slug
--   • внутренние дубли (одинаковый slug дважды в одной области)
-- =============================================================================

-- ─────────────────────────────────────────────────────────
-- Города-регионы, попавшие внутрь области
-- ─────────────────────────────────────────────────────────
delete from public.cities where slug = 'astana-akmola';           -- Астана в Акмолинской
delete from public.cities where slug = 'almaty-almaty';           -- Алматы в Алматинской
delete from public.cities where slug = 'shymkent-chimkent-turkistan'; -- Шымкент в Туркестанской

-- ─────────────────────────────────────────────────────────
-- Дубли со seed.sql (другой slug, то же название)
-- ─────────────────────────────────────────────────────────
delete from public.cities where slug = 'aktobe-aktobe';           -- = aktobe (seed)
delete from public.cities where slug = 'konaev-almaty';           -- = kapchagay (seed, name_ru Конаев)
delete from public.cities where slug = 'taldy-kurgan-almaty';     -- = taldykorgan (seed)
delete from public.cities where slug = 'atyrau-atyrau';           -- = atyrau (seed)
delete from public.cities where slug = 'ust-kamenogorsk-east-kazakhstan'; -- = oskemen (seed)
delete from public.cities where slug = 'semey-east-kazakhstan';   -- = semey (seed, теперь в abay)
delete from public.cities where slug = 'taraz-zhambyl';           -- = taraz (seed)
delete from public.cities where slug = 'ural-sk-west-kazakhstan'; -- = oral (seed)
delete from public.cities where slug = 'karaganda-karaganda';     -- = karaganda (seed)
delete from public.cities where slug = 'temirtau-karaganda';      -- = temirtau (seed)
delete from public.cities where slug = 'dzhezkazgan-karaganda';   -- = zhezkazgan (seed, теперь в ulytau)
delete from public.cities where slug = 'kostanay-kostanay';       -- = kostanay (seed)
delete from public.cities where slug = 'kyzylorda-kyzylorda';     -- = kyzylorda (seed)
delete from public.cities where slug = 'aktau-mangystau';         -- = aktau (seed)
delete from public.cities where slug = 'pavlodar-pavlodar';       -- = pavlodar (seed)
delete from public.cities where slug = 'ekibastuz-pavlodar';      -- = ekibastuz (seed)
delete from public.cities where slug = 'petropavlovsk-north-kazakhstan'; -- = petropavl (seed)
delete from public.cities where slug = 'turkestan-turkistan';     -- = turkistan (seed)
delete from public.cities where slug = 'kentau-turkistan';        -- = kentau (seed)

-- ─────────────────────────────────────────────────────────
-- Внутренние дубли (один slug вставлен дважды в исходном API-ответе)
-- ─────────────────────────────────────────────────────────
-- Для устранения дубля оставляем запись с меньшим id (первую вставленную).
-- Удаляем строки, у которых тот же (region_id, slug) но НЕ минимальный id.
delete from public.cities c
using (
  select slug, region_id, min(id) as keep_id
  from public.cities
  where slug in (
    'temir-aktobe',
    'alga-aktobe',
    'zharkent-almaty',
    'aydarly-kyzylorda'
  )
  group by slug, region_id
) sub
where c.slug = sub.slug
  and c.region_id = sub.region_id
  and c.id <> sub.keep_id;
