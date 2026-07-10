// Генерирует SQL-миграцию замены справочника локаций из КАТО.
// Запуск: node scripts/import-kato.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RU_CSV = join(ROOT, 'data/kato/KATO_18.06.2026_ru.csv');
const KZ_CSV = join(ROOT, 'data/kato/KATO_18.06.2026_kz.csv');
const OUT = join(ROOT, 'supabase/migrations/20260101001300_replace_locations_from_kato.sql');

/** Старые region.slug → стабильный slug (совпадает с текущим seed). */
const REGION_SLUG_BY_KATO_CODE = {
	'100000000': 'abay',
	'110000000': 'akmola',
	'150000000': 'aktobe',
	'190000000': 'almaty',
	'230000000': 'atyrau',
	'270000000': 'west-kazakhstan',
	'310000000': 'zhambyl',
	'330000000': 'zhetisu',
	'350000000': 'karaganda',
	'390000000': 'kostanay',
	'430000000': 'kyzylorda',
	'470000000': 'mangystau',
	'550000000': 'pavlodar',
	'590000000': 'north-kazakhstan',
	'610000000': 'turkistan',
	'620000000': 'ulytau',
	'630000000': 'east-kazakhstan',
	'710000000': 'astana',
	'750000000': 'almaty-city',
	'790000000': 'shymkent',
};

const CITY_REGION_CODES = new Set(['710000000', '750000000', '790000000']);

function parseCsv(path) {
	let raw = readFileSync(path, 'utf8');
	if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
	const lines = raw.split(/\r?\n/).filter(Boolean);
	const rows = [];
	for (let i = 1; i < lines.length; i++) {
		const cols = lines[i].split(';');
		if (cols.length < 4) continue;
		rows.push({
			id: Number(cols[0]),
			parent_id: Number(cols[1]),
			code: cols[2],
			name: cols.slice(3).join(';').trim(),
		});
	}
	return rows;
}

function slugify(str) {
	return str
		.toLowerCase()
		.replace(/ё/g, 'e')
		.replace(/а/g, 'a')
		.replace(/б/g, 'b')
		.replace(/в/g, 'v')
		.replace(/г/g, 'g')
		.replace(/д/g, 'd')
		.replace(/е/g, 'e')
		.replace(/ж/g, 'zh')
		.replace(/з/g, 'z')
		.replace(/и/g, 'i')
		.replace(/й/g, 'y')
		.replace(/к/g, 'k')
		.replace(/л/g, 'l')
		.replace(/м/g, 'm')
		.replace(/н/g, 'n')
		.replace(/о/g, 'o')
		.replace(/п/g, 'p')
		.replace(/р/g, 'r')
		.replace(/с/g, 's')
		.replace(/т/g, 't')
		.replace(/у/g, 'u')
		.replace(/ф/g, 'f')
		.replace(/х/g, 'h')
		.replace(/ц/g, 'ts')
		.replace(/ч/g, 'ch')
		.replace(/ш/g, 'sh')
		.replace(/щ/g, 'sch')
		.replace(/ы/g, 'y')
		.replace(/э/g, 'e')
		.replace(/ю/g, 'yu')
		.replace(/я/g, 'ya')
		.replace(/ә/g, 'a')
		.replace(/ғ/g, 'g')
		.replace(/қ/g, 'q')
		.replace(/ң/g, 'n')
		.replace(/ө/g, 'o')
		.replace(/ұ/g, 'u')
		.replace(/ү/g, 'u')
		.replace(/һ/g, 'h')
		.replace(/і/g, 'i')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60);
}

function esc(s) {
	return String(s).replace(/'/g, "''");
}

function stripRuPrefix(name) {
	return name
		.replace(/^(г\.а\.|с\.а\.|г\.|с\.|п\.|ст\.|пгт\.?)\s*/i, '')
		.replace(/^а\.\s*/i, '')
		.trim();
}

function stripKzPrefix(name) {
	return name
		.replace(/\s+(а\.ә\.|қ\.ә\.|қ\.|а\.|п\.|ст\.)$/i, '')
		.replace(/^(қ\.|а\.|п\.|ст\.)\s*/i, '')
		.trim();
}

function stripDistrictRu(name) {
	return name
		.replace(/^район\s+/i, '')
		.replace(/\s+район$/i, '')
		.replace(/(ский|ный|овый|ий|ый)$/i, '')
		.trim();
}

function isAdminUnitRu(name) {
	// сельская/городская администрация — не населённый пункт
	return /^с\.а\./i.test(name) || /^г\.а\./i.test(name);
}

function isSettlementRu(name) {
	if (isAdminUnitRu(name)) return false;
	return /^(г\.|с\.|п\.|ст\.|пгт\.?)/i.test(name);
}

function isCityDistrictRu(name) {
	return /район/i.test(name);
}

/** Предпочтение при схлопывании одноимённых НП в одной области. */
function settlementRank(s) {
	let score = 0;
	if (s.is_city) score += 100;
	if (/^г\./i.test(s.raw_ru)) score += 50;
	if (/^с\./i.test(s.raw_ru)) score += 20;
	if (/^п\./i.test(s.raw_ru)) score += 10;
	// короче код / «основной» центр округа обычно *100
	if (/00$/.test(s.kato_code) || /100$/.test(s.kato_code)) score += 5;
	return score;
}

function normalizeDisplayRu(name) {
	// «область Абай» → «Область Абай»; «г.Астана» → «Астана»
	if (/^г\./i.test(name)) return stripRuPrefix(name);
	if (/^область\s/i.test(name)) {
		return 'Область ' + name.replace(/^область\s+/i, '');
	}
	return name;
}

function normalizeDisplayKk(name) {
	if (/\sқ\.$/i.test(name)) return stripKzPrefix(name);
	return name;
}

function matchKeyName(name) {
	return name
		.toLowerCase()
		.replace(/ё/g, 'е')
		.replace(/ә/g, 'а')
		.replace(/ғ/g, 'г')
		.replace(/қ/g, 'к')
		.replace(/ң/g, 'н')
		.replace(/ө/g, 'о')
		.replace(/ұ/g, 'у')
		.replace(/ү/g, 'у')
		.replace(/һ/g, 'х')
		.replace(/і/g, 'и')
		.replace(/[^a-zа-я0-9]+/gi, '')
		.trim();
}

// --- parse ---
const ru = parseCsv(RU_CSV);
const kz = parseCsv(KZ_CSV);
const kzById = new Map(kz.map((r) => [r.id, r]));
const ruById = new Map(ru.map((r) => [r.id, r]));

function findRoot(id) {
	let cur = ruById.get(id);
	while (cur && cur.parent_id !== 0) cur = ruById.get(cur.parent_id);
	return cur;
}

const roots = ru.filter((r) => r.parent_id === 0);
if (roots.length !== 20) {
	console.error('Expected 20 roots, got', roots.length);
	process.exit(1);
}

// Regions
const regions = roots.map((r, idx) => {
	const slug = REGION_SLUG_BY_KATO_CODE[r.code];
	if (!slug) {
		console.error('Missing slug for', r.code, r.name);
		process.exit(1);
	}
	const k = kzById.get(r.id);
	const nameRu = normalizeDisplayRu(r.name);
	const nameKk = normalizeDisplayKk(k.name);
	return {
		id: idx + 1,
		slug,
		name_ru: nameRu,
		name_kk: nameKk,
		kato_code: r.code,
		kato_id: r.id,
		is_city_region: CITY_REGION_CODES.has(r.code),
	};
});
const regionByKatoId = new Map(regions.map((r) => [r.kato_id, r]));

// Settlements + city-region self rows
const settlements = [];
for (const r of ru) {
	const root = findRoot(r.id);
	if (!root) continue;
	const region = regionByKatoId.get(root.id);
	if (!region) continue;

	if (r.id === root.id) {
		if (region.is_city_region) {
			settlements.push({
				kato_id: r.id,
				kato_code: r.code,
				region_id: region.id,
				name_ru: normalizeDisplayRu(r.name),
				name_kk: normalizeDisplayKk(kzById.get(r.id).name),
				is_city: true,
				raw_ru: r.name,
			});
		}
		continue;
	}

	if (region.is_city_region && isCityDistrictRu(r.name)) continue;

	if (isSettlementRu(r.name)) {
		settlements.push({
			kato_id: r.id,
			kato_code: r.code,
			region_id: region.id,
			name_ru: stripRuPrefix(r.name),
			name_kk: stripKzPrefix(kzById.get(r.id).name),
			is_city: /^г\./i.test(r.name),
			raw_ru: r.name,
		});
	}
}

// Схлопываем одноимённые НП в пределах области (оставляем лучший)
const dedupedSettlements = [];
const bestByKey = new Map(); // region_id|match_key -> settlement
for (const s of settlements) {
	const key = `${s.region_id}|${matchKeyName(s.name_ru)}`;
	const prev = bestByKey.get(key);
	if (!prev) {
		bestByKey.set(key, s);
		continue;
	}
	const rankNew = settlementRank(s);
	const rankOld = settlementRank(prev);
	if (rankNew > rankOld || (rankNew === rankOld && s.kato_code < prev.kato_code)) {
		bestByKey.set(key, s);
	}
}
for (const s of bestByKey.values()) dedupedSettlements.push(s);
dedupedSettlements.sort((a, b) => a.region_id - b.region_id || a.kato_code.localeCompare(b.kato_code));

console.error(
	`Settlements raw: ${settlements.length}, after dedupe: ${dedupedSettlements.length} (−${settlements.length - dedupedSettlements.length})`,
);

// Unique slugs per region
const cities = [];
const usedSlugs = new Map(); // region_id -> Set
for (const s of dedupedSettlements) {
	if (!usedSlugs.has(s.region_id)) usedSlugs.set(s.region_id, new Set());
	const set = usedSlugs.get(s.region_id);
	let base = slugify(s.name_ru) || 'np';
	let slug = base;
	if (set.has(slug)) slug = `${base}-${s.kato_code}`;
	set.add(slug);
	cities.push({
		id: cities.length + 1,
		region_id: s.region_id,
		slug,
		name_ru: s.name_ru,
		name_kk: s.name_kk,
		kato_code: s.kato_code,
		match_key: matchKeyName(s.name_ru),
		is_city: s.is_city ? 1 : 0,
	});
}

// Districts under city-regions
const cityByRegionAndIsSelf = new Map();
for (const c of cities) {
	const region = regions.find((r) => r.id === c.region_id);
	if (region?.is_city_region && c.kato_code === region.kato_code) {
		cityByRegionAndIsSelf.set(region.id, c);
	}
}

const districts = [];
const usedDistrictSlugs = new Map();
for (const r of ru) {
	const root = findRoot(r.id);
	if (!root || r.id === root.id) continue;
	const region = regionByKatoId.get(root.id);
	if (!region?.is_city_region) continue;
	if (!isCityDistrictRu(r.name)) continue;

	const parentCity = cityByRegionAndIsSelf.get(region.id);
	if (!parentCity) {
		console.error('No parent city for district', r.name);
		process.exit(1);
	}

	const nameRu = r.name.replace(/^район\s+/i, '').trim();
	const nameKk = kzById.get(r.id).name.replace(/\s+ауданы$/i, '').trim();
	const matchKey = matchKeyName(stripDistrictRu(r.name));

	if (!usedDistrictSlugs.has(parentCity.id)) usedDistrictSlugs.set(parentCity.id, new Set());
	const set = usedDistrictSlugs.get(parentCity.id);
	let base = slugify(nameRu) || 'district';
	let slug = base;
	if (set.has(slug)) slug = `${base}-${r.code}`;
	set.add(slug);

	districts.push({
		id: districts.length + 1,
		city_id: parentCity.id,
		slug,
		name_ru: nameRu,
		name_kk: nameKk,
		kato_code: r.code,
		match_key: matchKey,
	});
}

console.error(`Regions: ${regions.length}`);
console.error(`Cities: ${cities.length}`);
console.error(`Districts: ${districts.length}`);

// --- SQL generation ---
const lines = [];
const push = (...xs) => lines.push(...xs);

push(`-- =============================================================================`);
push(`-- 20260101001300_replace_locations_from_kato.sql`);
push(`-- Замена справочника локаций на КАТО 18.06.2026`);
push(`-- Regions: ${regions.length}, cities: ${cities.length}, districts: ${districts.length}`);
push(`-- Remap listings/events по slug региона + нормализованному имени`);
push(`-- =============================================================================`);
push(``);
push(`begin;`);
push(``);
push(`-- 1. kato_code`);
push(`alter table public.regions add column if not exists kato_code text;`);
push(`alter table public.cities add column if not exists kato_code text;`);
push(`alter table public.districts add column if not exists kato_code text;`);
push(``);
push(`create unique index if not exists regions_kato_code_uidx on public.regions (kato_code) where kato_code is not null;`);
push(`create unique index if not exists cities_kato_code_uidx on public.cities (kato_code) where kato_code is not null;`);
push(`create unique index if not exists districts_kato_code_uidx on public.districts (kato_code) where kato_code is not null;`);
push(``);
push(`-- 2. Staging`);
push(`create temporary table regions_new (`);
push(`  id smallint primary key,`);
push(`  slug text not null,`);
push(`  name_ru text not null,`);
push(`  name_kk text not null,`);
push(`  kato_code text not null`);
push(`) on commit drop;`);
push(``);
push(`create temporary table cities_new (`);
push(`  id integer primary key,`);
push(`  region_id smallint not null,`);
push(`  slug text not null,`);
push(`  name_ru text not null,`);
push(`  name_kk text not null,`);
push(`  kato_code text not null,`);
push(`  match_key text not null,`);
push(`  is_city smallint not null default 0`);
push(`) on commit drop;`);
push(``);
push(`create temporary table districts_new (`);
push(`  id integer primary key,`);
push(`  city_id integer not null,`);
push(`  slug text not null,`);
push(`  name_ru text not null,`);
push(`  name_kk text not null,`);
push(`  kato_code text not null,`);
push(`  match_key text not null`);
push(`) on commit drop;`);
push(``);

function insertBatches(table, cols, rows, mapRow, batchSize = 400) {
	for (let i = 0; i < rows.length; i += batchSize) {
		const chunk = rows.slice(i, i + batchSize);
		push(`insert into ${table} (${cols}) values`);
		push(
			chunk
				.map((row, j) => {
					const vals = mapRow(row);
					const comma = j === chunk.length - 1 ? ';' : ',';
					return `  (${vals.join(', ')})${comma}`;
				})
				.join('\n'),
		);
		push(``);
	}
}

push(`-- 3. Load staging: regions`);
insertBatches(
	'regions_new',
	'id, slug, name_ru, name_kk, kato_code',
	regions,
	(r) => [r.id, `'${esc(r.slug)}'`, `'${esc(r.name_ru)}'`, `'${esc(r.name_kk)}'`, `'${esc(r.kato_code)}'`],
);

push(`-- 4. Load staging: cities`);
insertBatches(
	'cities_new',
	'id, region_id, slug, name_ru, name_kk, kato_code, match_key, is_city',
	cities,
	(c) => [
		c.id,
		c.region_id,
		`'${esc(c.slug)}'`,
		`'${esc(c.name_ru)}'`,
		`'${esc(c.name_kk)}'`,
		`'${esc(c.kato_code)}'`,
		`'${esc(c.match_key)}'`,
		c.is_city,
	],
);

push(`-- 5. Load staging: districts`);
insertBatches(
	'districts_new',
	'id, city_id, slug, name_ru, name_kk, kato_code, match_key',
	districts,
	(d) => [
		d.id,
		d.city_id,
		`'${esc(d.slug)}'`,
		`'${esc(d.name_ru)}'`,
		`'${esc(d.name_kk)}'`,
		`'${esc(d.kato_code)}'`,
		`'${esc(d.match_key)}'`,
	],
);

push(`-- 6. Normalize helpers (immutable expressions via temp functions)`);
push(`create or replace function pg_temp.norm_name(t text)`);
push(`returns text language sql immutable as $$`);
push(`  select regexp_replace(`);
push(`    translate(lower(coalesce(t, '')), 'ёәғқңөұүһі', 'еагкноуухи'),`);
push(`    '[^a-zа-я0-9]+', '', 'g'`);
push(`  );`);
push(`$$;`);
push(``);
push(`create or replace function pg_temp.norm_district(t text)`);
push(`returns text language sql immutable as $$`);
push(`  select pg_temp.norm_name(`);
push(`    regexp_replace(`);
push(`      regexp_replace(coalesce(t, ''), '^район\\s+', '', 'i'),`);
push(`      '(ский|ный|овый|ий|ый)$', '', 'i'`);
push(`    )`);
push(`  );`);
push(`$$;`);
push(``);

push(`-- 7. ID maps (old → new)`);
push(`create temporary table region_id_map (`);
push(`  old_id smallint primary key,`);
push(`  new_id smallint not null`);
push(`) on commit drop;`);
push(``);
push(`insert into region_id_map (old_id, new_id)`);
push(`select r.id, n.id`);
push(`from public.regions r`);
push(`join regions_new n on n.slug = r.slug;`);
push(``);

push(`create temporary table city_id_map (`);
push(`  old_id integer primary key,`);
push(`  new_id integer not null`);
push(`) on commit drop;`);
push(``);
push(`insert into city_id_map (old_id, new_id)`);
push(`select distinct on (c.id) c.id, n.id`);
push(`from public.cities c`);
push(`join public.regions r on r.id = c.region_id`);
push(`join region_id_map rm on rm.old_id = r.id`);
push(`join cities_new n`);
push(`  on n.region_id = rm.new_id`);
push(` and n.match_key = pg_temp.norm_name(c.name_ru)`);
push(`order by c.id, n.is_city desc, n.kato_code;`);
push(``);

push(`create temporary table district_id_map (`);
push(`  old_id integer primary key,`);
push(`  new_id integer not null`);
push(`) on commit drop;`);
push(``);
push(`insert into district_id_map (old_id, new_id)`);
push(`select distinct on (d.id) d.id, n.id`);
push(`from public.districts d`);
push(`join public.cities c on c.id = d.city_id`);
push(`join city_id_map cm on cm.old_id = c.id`);
push(`join districts_new n`);
push(`  on n.city_id = cm.new_id`);
push(` and n.match_key = pg_temp.norm_district(d.name_ru)`);
push(`order by d.id, n.kato_code;`);
push(``);

push(`-- 8. Snapshot listing/event remaps before DELETE (SET NULL)`);
push(`create temporary table listing_remap (`);
push(`  listing_id uuid primary key,`);
push(`  region_id smallint,`);
push(`  city_id integer,`);
push(`  district_id integer`);
push(`) on commit drop;`);
push(``);
push(`insert into listing_remap (listing_id, region_id, city_id, district_id)`);
push(`select`);
push(`  l.id,`);
push(`  rm.new_id,`);
push(`  cm.new_id,`);
push(`  dm.new_id`);
push(`from public.listings l`);
push(`left join region_id_map rm on rm.old_id = l.region_id`);
push(`left join city_id_map cm on cm.old_id = l.city_id`);
push(`left join district_id_map dm on dm.old_id = l.district_id`);
push(`where l.region_id is not null or l.city_id is not null or l.district_id is not null;`);
push(``);

push(`create temporary table event_remap (`);
push(`  event_id uuid primary key,`);
push(`  city_id integer`);
push(`) on commit drop;`);
push(``);
push(`insert into event_remap (event_id, city_id)`);
push(`select e.id, cm.new_id`);
push(`from public.events e`);
push(`left join city_id_map cm on cm.old_id = e.city_id`);
push(`where e.city_id is not null;`);
push(``);

push(`-- 9. Replace dictionary`);
push(`delete from public.districts;`);
push(`delete from public.cities;`);
push(`delete from public.regions;`);
push(``);
push(`insert into public.regions (id, slug, name_ru, name_kk, kato_code)`);
push(`select id, slug, name_ru, name_kk, kato_code from regions_new;`);
push(``);
push(`insert into public.cities (id, region_id, slug, name_ru, name_kk, kato_code)`);
push(`select id, region_id, slug, name_ru, name_kk, kato_code from cities_new;`);
push(``);
push(`insert into public.districts (id, city_id, slug, name_ru, name_kk, kato_code)`);
push(`select id, city_id, slug, name_ru, name_kk, kato_code from districts_new;`);
push(``);

push(`-- 10. Restore FKs on content`);
push(`update public.listings l`);
push(`set`);
push(`  region_id = lr.region_id,`);
push(`  city_id = lr.city_id,`);
push(`  district_id = lr.district_id`);
push(`from listing_remap lr`);
push(`where l.id = lr.listing_id;`);
push(``);
push(`update public.events e`);
push(`set city_id = er.city_id`);
push(`from event_remap er`);
push(`where e.id = er.event_id;`);
push(``);

push(`-- 11. Sequences`);
push(`select setval(pg_get_serial_sequence('public.regions', 'id'), coalesce((select max(id) from public.regions), 1));`);
push(`select setval(pg_get_serial_sequence('public.cities', 'id'), coalesce((select max(id) from public.cities), 1));`);
push(`select setval(pg_get_serial_sequence('public.districts', 'id'), coalesce((select max(id) from public.districts), 1));`);
push(``);
push(`commit;`);

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.error(`Written ${OUT}`);
console.error(`SQL size: ${(lines.join('\n').length / 1024 / 1024).toFixed(2)} MB`);
