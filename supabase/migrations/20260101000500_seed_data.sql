-- =============================================================================
-- seed.sql — справочники регионов, городов, районов и категорий
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Области и города республиканского значения Казахстана (актуально на 2024)
-- -----------------------------------------------------------------------------
insert into public.regions (slug, name_ru, name_kk) values
	('astana', 'Астана', 'Астана'),
	('almaty-city', 'Алматы', 'Алматы'),
	('shymkent', 'Шымкент', 'Шымкент'),
	('akmola', 'Акмолинская область', 'Ақмола облысы'),
	('aktobe', 'Актюбинская область', 'Ақтөбе облысы'),
	('almaty', 'Алматинская область', 'Алматы облысы'),
	('atyrau', 'Атырауская область', 'Атырау облысы'),
	('east-kazakhstan', 'Восточно-Казахстанская область', 'Шығыс Қазақстан облысы'),
	('zhambyl', 'Жамбылская область', 'Жамбыл облысы'),
	('zhetisu', 'Жетысуская область', 'Жетісу облысы'),
	('west-kazakhstan', 'Западно-Казахстанская область', 'Батыс Қазақстан облысы'),
	('karaganda', 'Карагандинская область', 'Қарағанды облысы'),
	('kostanay', 'Костанайская область', 'Қостанай облысы'),
	('kyzylorda', 'Кызылординская область', 'Қызылорда облысы'),
	('mangystau', 'Мангистауская область', 'Маңғыстау облысы'),
	('pavlodar', 'Павлодарская область', 'Павлодар облысы'),
	('north-kazakhstan', 'Северо-Казахстанская область', 'Солтүстік Қазақстан облысы'),
	('turkistan', 'Туркестанская область', 'Түркістан облысы'),
	('ulytau', 'Улытауская область', 'Ұлытау облысы'),
	('abay', 'Область Абай', 'Абай облысы')
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Крупнейшие города
-- -----------------------------------------------------------------------------
insert into public.cities (region_id, slug, name_ru, name_kk)
select r.id, c.slug, c.name_ru, c.name_kk
from (values
	('astana', 'astana', 'Астана', 'Астана'),
	('almaty-city', 'almaty', 'Алматы', 'Алматы'),
	('shymkent', 'shymkent', 'Шымкент', 'Шымкент'),
	('akmola', 'kokshetau', 'Кокшетау', 'Көкшетау'),
	('akmola', 'stepnogorsk', 'Степногорск', 'Степногорск'),
	('aktobe', 'aktobe', 'Актобе', 'Ақтөбе'),
	('almaty', 'taldykorgan', 'Талдыкорган', 'Талдықорған'),
	('almaty', 'kaskelen', 'Каскелен', 'Қаскелең'),
	('almaty', 'kapchagay', 'Конаев', 'Қонаев'),
	('atyrau', 'atyrau', 'Атырау', 'Атырау'),
	('east-kazakhstan', 'oskemen', 'Усть-Каменогорск', 'Өскемен'),
	('zhambyl', 'taraz', 'Тараз', 'Тараз'),
	('zhetisu', 'taldykorgan-zhetisu', 'Талдыкорган', 'Талдықорған'),
	('west-kazakhstan', 'oral', 'Уральск', 'Орал'),
	('karaganda', 'karaganda', 'Караганда', 'Қарағанды'),
	('karaganda', 'temirtau', 'Темиртау', 'Теміртау'),
	('kostanay', 'kostanay', 'Костанай', 'Қостанай'),
	('kyzylorda', 'kyzylorda', 'Кызылорда', 'Қызылорда'),
	('mangystau', 'aktau', 'Актау', 'Ақтау'),
	('pavlodar', 'pavlodar', 'Павлодар', 'Павлодар'),
	('pavlodar', 'ekibastuz', 'Экибастуз', 'Екібастұз'),
	('north-kazakhstan', 'petropavl', 'Петропавловск', 'Петропавл'),
	('turkistan', 'turkistan', 'Туркестан', 'Түркістан'),
	('turkistan', 'kentau', 'Кентау', 'Кентау'),
	('ulytau', 'zhezkazgan', 'Жезказган', 'Жезқазған'),
	('abay', 'semey', 'Семей', 'Семей')
) as c(region_slug, slug, name_ru, name_kk)
join public.regions r on r.slug = c.region_slug
on conflict (region_id, slug) do nothing;

-- -----------------------------------------------------------------------------
-- Районы крупнейших городов (Астана, Алматы, Шымкент)
-- -----------------------------------------------------------------------------
insert into public.districts (city_id, slug, name_ru, name_kk)
select c.id, d.slug, d.name_ru, d.name_kk
from (values
	('astana', 'esil', 'Есильский', 'Есіл'),
	('astana', 'almaty', 'Алматинский', 'Алматы'),
	('astana', 'saryarka', 'Сарыаркинский', 'Сарыарқа'),
	('astana', 'baikonur', 'Байконур', 'Байқоңыр'),
	('astana', 'nura', 'Нура', 'Нұра'),
	('almaty', 'almaly', 'Алмалинский', 'Алмалы'),
	('almaty', 'auezov', 'Ауэзовский', 'Әуезов'),
	('almaty', 'bostandyk', 'Бостандыкский', 'Бостандық'),
	('almaty', 'zhetysu', 'Жетысуский', 'Жетісу'),
	('almaty', 'medeu', 'Медеуский', 'Медеу'),
	('almaty', 'nauryzbay', 'Наурызбайский', 'Наурызбай'),
	('almaty', 'turksib', 'Турксибский', 'Түрксіб'),
	('almaty', 'alatau', 'Алатауский', 'Алатау'),
	('shymkent', 'abay', 'Абайский', 'Абай'),
	('shymkent', 'al-farabi', 'Аль-Фарабийский', 'Әл-Фараби'),
	('shymkent', 'enbekshi', 'Енбекшинский', 'Еңбекші'),
	('shymkent', 'karatau', 'Каратауский', 'Қаратау'),
	('shymkent', 'tursistan', 'Туран', 'Тұран')
) as d(city_slug, slug, name_ru, name_kk)
join public.cities c on c.slug = d.city_slug
on conflict (city_id, slug) do nothing;

-- -----------------------------------------------------------------------------
-- Категории
-- -----------------------------------------------------------------------------
-- pets (домашние животные)
insert into public.categories (slug, kind, name_ru, name_kk, icon, sort_order) values
	('dogs', 'pets', 'Собаки', 'Иттер', 'dog', 10),
	('cats', 'pets', 'Кошки', 'Мысықтар', 'cat', 20),
	('birds', 'pets', 'Птицы', 'Құстар', 'bird', 30),
	('aquarium', 'pets', 'Аквариумистика', 'Аквариум', 'fish', 40),
	('rodents', 'pets', 'Грызуны', 'Кеміргіштер', 'rabbit', 50),
	('reptiles', 'pets', 'Рептилии', 'Бауырымен жорғалаушылар', 'turtle', 60),
	('other-pets', 'pets', 'Прочие питомцы', 'Басқа үй жануарлары', 'paw-print', 70)
on conflict (slug) do nothing;

-- livestock (скот)
insert into public.categories (slug, kind, name_ru, name_kk, icon, sort_order) values
	('cattle', 'livestock', 'КРС (коровы, быки)', 'ІҚМ (сиырлар, бұқалар)', 'cow', 10),
	('small-cattle', 'livestock', 'МРС (овцы, козы)', 'ҰҚМ (қойлар, ешкілер)', 'sheep', 20),
	('horses', 'livestock', 'Лошади', 'Жылқылар', 'horse', 30),
	('camels', 'livestock', 'Верблюды', 'Түйелер', 'camel', 40),
	('poultry', 'livestock', 'Птица (куры, гуси)', 'Құс (тауық, қаз)', 'bird', 50),
	('pigs', 'livestock', 'Свиньи', 'Шошқалар', 'pig', 60),
	('rabbits-farm', 'livestock', 'Кролики', 'Қояндар', 'rabbit', 70)
on conflict (slug) do nothing;

-- goods (около-животные товары)
insert into public.categories (slug, kind, name_ru, name_kk, icon, sort_order) values
	('feed', 'goods', 'Корма', 'Жем', 'wheat', 10),
	('accessories', 'goods', 'Аксессуары и амуниция', 'Аксессуарлар', 'collar', 20),
	('cages', 'goods', 'Клетки и переноски', 'Торлар, тасығыштар', 'package', 30),
	('vet-supplies', 'goods', 'Ветпрепараты', 'Ветпрепараттар', 'pill', 40),
	('hygiene', 'goods', 'Гигиена и уход', 'Гигиена', 'spray-can', 50)
on conflict (slug) do nothing;

-- services (услуги)
insert into public.categories (slug, kind, name_ru, name_kk, icon, sort_order) values
	('vet', 'services', 'Ветеринар', 'Ветеринар', 'stethoscope', 10),
	('grooming', 'services', 'Груминг', 'Груминг', 'scissors', 20),
	('cynology', 'services', 'Кинолог / дрессура', 'Кинолог / жаттықтыру', 'graduation-cap', 30),
	('boarding', 'services', 'Передержка', 'Уақытша ұстау', 'home', 40),
	('transport', 'services', 'Перевозка животных', 'Жануарларды тасымалдау', 'truck', 50),
	('mating', 'services', 'Вязка', 'Ұрықтандыру', 'heart', 60)
on conflict (slug) do nothing;
