// Скрипт: скачивает города из namaztimes.kz API и генерирует SQL-миграцию
// Запуск: node scripts/fetch-cities.mjs
import { writeFileSync } from 'fs';

const BASE = 'https://namaztimes.kz/ru/api/cities';
const OUT  = new URL('../supabase/migrations/20260101000900_expand_cities.sql', import.meta.url);

// Наши region.slug → slug для API namaztimes (id=99 = Казахстан)
// Новые регионы 2022 (Жетысу, Улытау, Абай) и города-регионы в API отсутствуют
const REGION_MAP = [
  { slug: 'akmola',           api: 'Akmola' },
  { slug: 'aktobe',           api: 'Aqtobe' },
  { slug: 'almaty',           api: 'Almaty' },
  { slug: 'atyrau',           api: 'Atyrau' },
  { slug: 'east-kazakhstan',  api: 'East Kazakhstan' },
  { slug: 'zhambyl',          api: 'Dzhambul (Zhambyl)' },
  { slug: 'west-kazakhstan',  api: 'West Kazakhstan' },
  { slug: 'karaganda',        api: 'Karaganda' },
  { slug: 'kostanay',         api: 'Qostanay' },
  { slug: 'kyzylorda',        api: 'Kyzylorda' },
  { slug: 'mangystau',        api: 'Mangystau' },
  { slug: 'pavlodar',         api: 'Pavlodar' },
  { slug: 'north-kazakhstan', api: 'North Kazakhstan' },
  { slug: 'turkistan',        api: 'South Kazakhstan' },
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/ё/g,'e').replace(/а/g,'a').replace(/б/g,'b').replace(/в/g,'v')
    .replace(/г/g,'g').replace(/д/g,'d').replace(/е/g,'e').replace(/ж/g,'zh')
    .replace(/з/g,'z').replace(/и/g,'i').replace(/й/g,'y').replace(/к/g,'k')
    .replace(/л/g,'l').replace(/м/g,'m').replace(/н/g,'n').replace(/о/g,'o')
    .replace(/п/g,'p').replace(/р/g,'r').replace(/с/g,'s').replace(/т/g,'t')
    .replace(/у/g,'u').replace(/ф/g,'f').replace(/х/g,'h').replace(/ц/g,'ts')
    .replace(/ч/g,'ch').replace(/ш/g,'sh').replace(/щ/g,'sch').replace(/ы/g,'y')
    .replace(/э/g,'e').replace(/ю/g,'yu').replace(/я/g,'ya')
    .replace(/ә/g,'a').replace(/ғ/g,'g').replace(/қ/g,'q').replace(/ң/g,'n')
    .replace(/ө/g,'o').replace(/ұ/g,'u').replace(/ү/g,'u').replace(/һ/g,'h')
    .replace(/і/g,'i')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 60);
}

function esc(s) { return s.replace(/'/g, "''"); }

async function fetchCities(apiSlug) {
  const url = `${BASE}?id=${encodeURIComponent(apiSlug)}&type=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BuzauApp/1.0' } });
    if (!res.ok) return null;
    const text = await res.text();
    const clean = text.replace(/^[^{[]*/, '').replace(/[^}\]]*$/, '');
    if (!clean) return null;
    return JSON.parse(clean);
  } catch (e) {
    console.error('fetch error', apiSlug, e.message);
    return null;
  }
}

const lines = [];
lines.push('-- =============================================================================');
lines.push('-- 20260101000900_expand_cities.sql');
lines.push('-- Расширенный список городов и населённых пунктов из namaztimes.kz API');
lines.push('-- Охват: 14 областей (данные по городам-регионам и новым областям 2022');
lines.push('-- добавляются вручную при необходимости)');
lines.push('-- =============================================================================');
lines.push('');

let totalAdded = 0;

for (const region of REGION_MAP) {
  console.error(`Fetching ${region.slug} (api: ${region.api})...`);
  const cities = await fetchCities(region.api);

  if (!cities || typeof cities !== 'object') {
    console.error(`  → no data`);
    continue;
  }

  const entries = Object.entries(cities);
  console.error(`  → ${entries.length} cities`);
  if (entries.length === 0) continue;

  lines.push(`-- ${region.slug} (${entries.length})`);

  const values = entries.map(([, name]) => {
    const s = slugify(name) + '-' + region.slug;
    return `  ('${esc(s)}', '${esc(name)}', '${esc(name)}', '${esc(region.slug)}')`;
  }).join(',\n');

  lines.push(`insert into public.cities (slug, name_ru, name_kk, region_id)`);
  lines.push(`select v.slug, v.name_ru, v.name_kk, r.id`);
  lines.push(`from (values`);
  lines.push(values);
  lines.push(`) as v(slug, name_ru, name_kk, region_slug)`);
  lines.push(`join public.regions r on r.slug = v.region_slug`);
  lines.push(`on conflict (region_id, slug) do nothing;`);
  lines.push('');

  totalAdded += entries.length;
  await new Promise(r => setTimeout(r, 400));
}

console.error(`\nTotal: ${totalAdded} cities across ${REGION_MAP.length} regions`);

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.error(`Written to ${OUT.pathname}`);
