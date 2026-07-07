-- =============================================================================
-- 20260101000900_expand_cities.sql
-- Расширенный список городов и населённых пунктов из namaztimes.kz API
-- Дубли с seed.sql и города-регионы удалены
-- =============================================================================

-- akmola (25)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('atbasar-akmola', 'Атбасар', 'Атбасар', 'akmola'),
  ('novorybinka-akmola', 'Новорыбинка', 'Новорыбинка', 'akmola'),
  ('kokchetav-akmola', 'Кокчетав', 'Кокчетав', 'akmola'),
  ('esil-akmola', 'Есиль', 'Есиль', 'akmola'),
  ('akkul-akmola', 'Аккуль', 'Аккуль', 'akmola'),
  ('molodezhnoe-akmola', 'Молодёжное', 'Молодёжное', 'akmola'),
  ('kyzyltan-akmola', 'Кызылтан', 'Кызылтан', 'akmola'),
  ('alekseevka-akmola', 'Алексеевка', 'Алексеевка', 'akmola'),
  ('ozen-razdol-noe-akmola', 'Озен (Раздольное)', 'Озен (Раздольное)', 'akmola'),
  ('azat-akmola', 'Азат', 'Азат', 'akmola'),
  ('orken-kuropatkino-akmola', 'Оркен (Куропаткино)', 'Оркен (Куропаткино)', 'akmola'),
  ('terekti-lineevka-akmola', 'Теректи (Линеевка)', 'Теректи (Линеевка)', 'akmola'),
  ('uyaly-chaglinskiy-s-o-akmola', 'Уялы (Чаглинский С.О)', 'Уялы (Чаглинский С.О)', 'akmola'),
  ('kulet-akmola', 'Кулет', 'Кулет', 'akmola'),
  ('zhamantuz-akmola', 'Жамантуз', 'Жамантуз', 'akmola'),
  ('schuchinsk-akmola', 'Щучинск', 'Щучинск', 'akmola'),
  ('akylbay-akmola', 'Акылбай', 'Акылбай', 'akmola'),
  ('ortak-akmola', 'Ортак', 'Ортак', 'akmola'),
  ('tok-akmola', 'Ток', 'Ток', 'akmola'),
  ('bidayyk-bidaik-akmola', 'Бидайык (Бидаик)', 'Бидайык (Бидаик)', 'akmola'),
  ('kaskat-akmola', 'Каскат', 'Каскат', 'akmola'),
  ('zhanalyk-akmola-obl-akmola', 'Жаналык (Акмола обл)', 'Жаналык (Акмола обл)', 'akmola'),
  ('dal-niy-akmola', 'Дальний', 'Дальний', 'akmola'),
  ('baurkaragay-akmola', 'Бауркарагай', 'Бауркарагай', 'akmola'),
  ('al-bek-akmola', 'Альбек', 'Альбек', 'akmola')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- aktobe (30)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('akshimrau-aktobe', 'Акшимрау', 'Акшимрау', 'aktobe'),
  ('beyneu-aktobe', 'Бейнеу', 'Бейнеу', 'aktobe'),
  ('akkabak-aktobe', 'Аккабак', 'Аккабак', 'aktobe'),
  ('alga-aktobe', 'Алга', 'Алга', 'aktobe'),
  ('berchogur-aktobe', 'Берчогур', 'Берчогур', 'aktobe'),
  ('bestamak-aktobe', 'Бестамак', 'Бестамак', 'aktobe'),
  ('ulpan-aktobe', 'Улпан', 'Улпан', 'aktobe'),
  ('shoshkakol-aktobe', 'Шошкаколь', 'Шошкаколь', 'aktobe'),
  ('irgiz-aktobe', 'Иргиз', 'Иргиз', 'aktobe'),
  ('kalinovka-aktobe', 'Калиновка', 'Калиновка', 'aktobe'),
  ('karatogay-aktobe', 'Каратогай', 'Каратогай', 'aktobe'),
  ('karaulkel-dy-aktobe', 'Караулкельды', 'Караулкельды', 'aktobe'),
  ('kazatskiy-aktobe', 'Казацкий', 'Казацкий', 'aktobe'),
  ('hromtau-aktobe', 'Хромтау', 'Хромтау', 'aktobe'),
  ('kulakshi-aktobe', 'Кулакши', 'Кулакши', 'aktobe'),
  ('nogayty-aktobe', 'Ногайты', 'Ногайты', 'aktobe'),
  ('novorossiyskiy-aktobe', 'Новороссийский', 'Новороссийский', 'aktobe'),
  ('ogorodnyy-aktobe', 'Огородный', 'Огородный', 'aktobe'),
  ('saryoba-aktobe', 'Сарыоба', 'Сарыоба', 'aktobe'),
  ('skol-aktobe', 'Скол', 'Скол', 'aktobe'),
  ('sokyrbulak-aktobe', 'Сокырбулак', 'Сокырбулак', 'aktobe'),
  ('karabutak-aktobe', 'Карабутак', 'Карабутак', 'aktobe'),
  ('kurmansay-stepanovka-aktobe', 'Курмансай (Степановка)', 'Курмансай (Степановка)', 'aktobe'),
  ('temir-aktobe', 'Темир', 'Темир', 'aktobe'),
  ('togyz-aktobe', 'Тогыз', 'Тогыз', 'aktobe'),
  ('oyyl-aktobe', 'Ойыл', 'Ойыл', 'aktobe'),
  ('zarya-oktyabrya-aktobe', 'Заря Октября', 'Заря Октября', 'aktobe'),
  ('zharkamys-aktobe', 'Жаркамыс', 'Жаркамыс', 'aktobe'),
  ('shalkar-aktobe', 'Шалкар', 'Шалкар', 'aktobe'),
  ('marzhanbulak-progress-aktobe', 'Маржанбулак (Прогресс)', 'Маржанбулак (Прогресс)', 'aktobe')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- almaty (28)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('bakanas-almaty', 'Баканас', 'Баканас', 'almaty'),
  ('birlik-almaty', 'Бирлик', 'Бирлик', 'almaty'),
  ('shalkydysu-almaty', 'Шалкыдысу', 'Шалкыдысу', 'almaty'),
  ('tokzhaylau-almaty', 'Токжайлау', 'Токжайлау', 'almaty'),
  ('karaoy-almaty', 'Караой', 'Караой', 'almaty'),
  ('koksu-almaty', 'Коксу', 'Коксу', 'almaty'),
  ('koktuma-almaty', 'Коктума', 'Коктума', 'almaty'),
  ('kuygan-almaty', 'Куйган', 'Куйган', 'almaty'),
  ('lepsy-almaty', 'Лепсы', 'Лепсы', 'almaty'),
  ('matay-almaty', 'Матай', 'Матай', 'almaty'),
  ('zharkent-almaty', 'Жаркент', 'Жаркент', 'almaty'),
  ('sarkand-almaty', 'Сарканд', 'Сарканд', 'almaty'),
  ('saryozek-almaty', 'Сарыозек', 'Сарыозек', 'almaty'),
  ('tegermen-almaty', 'Тегермен', 'Тегермен', 'almaty'),
  ('tekeli-almaty', 'Текели', 'Текели', 'almaty'),
  ('ushtobe-almaty', 'Уштобе', 'Уштобе', 'almaty'),
  ('talgar-almaty', 'Талгар', 'Талгар', 'almaty'),
  ('tomar-almaty', 'Томар', 'Томар', 'almaty'),
  ('narynkol-almaty', 'Нарынкол', 'Нарынкол', 'almaty'),
  ('chundzha-almaty', 'Чунджа', 'Чунджа', 'almaty'),
  ('kegen-almaty', 'Кеген', 'Кеген', 'almaty'),
  ('esik-almaty', 'Есик', 'Есик', 'almaty'),
  ('kostobe-almaty', 'Костобе', 'Костобе', 'almaty'),
  ('boyauly-almaty', 'Бояулы', 'Бояулы', 'almaty'),
  ('baribaeva-almaty', 'Барибаева', 'Барибаева', 'almaty'),
  ('akkol-almatinskaya-obl-almaty', 'Акколь (Алматинская обл)', 'Акколь (Алматинская обл)', 'almaty'),
  ('bakbakty-almaty', 'Бакбакты', 'Бакбакты', 'almaty'),
  ('usharal-almaty', 'Ушарал', 'Ушарал', 'almaty')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- atyrau (43)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('aybas-atyrau', 'Айбас', 'Айбас', 'atyrau'),
  ('bayshunas-atyrau', 'Байшунас', 'Байшунас', 'atyrau'),
  ('dossor-atyrau', 'Доссор', 'Доссор', 'atyrau'),
  ('inderbor-atyrau', 'Индербор', 'Индербор', 'atyrau'),
  ('karaton-atyrau', 'Каратон', 'Каратон', 'atyrau'),
  ('komsomol-skiy-atyrau', 'Комсомольский', 'Комсомольский', 'atyrau'),
  ('kul-sary-atyrau', 'Кульсары', 'Кульсары', 'atyrau'),
  ('makat-atyrau', 'Макат', 'Макат', 'atyrau'),
  ('miyaly-atyrau', 'Миялы', 'Миялы', 'atyrau'),
  ('mukur-atyrau', 'Мукур', 'Мукур', 'atyrau'),
  ('munayly-atyrau', 'Мунайлы', 'Мунайлы', 'atyrau'),
  ('prorva-atyrau', 'Прорва', 'Прорва', 'atyrau'),
  ('sarayshyk-atyrau', 'Сарайшык', 'Сарайшык', 'atyrau'),
  ('zaburun-e-atyrau', 'Забурунье', 'Забурунье', 'atyrau'),
  ('zhamansor-atyrau', 'Жамансор', 'Жамансор', 'atyrau'),
  ('zhangaly-atyrau', 'Жангалы', 'Жангалы', 'atyrau'),
  ('akiz-atyrau', 'Акиз', 'Акиз', 'atyrau'),
  ('akkiztogay-atyrau', 'Аккизтогай', 'Аккизтогай', 'atyrau'),
  ('akkistau-atyrau', 'Аккистау', 'Аккистау', 'atyrau'),
  ('atekb-atyrau', 'Атекб', 'Атекб', 'atyrau'),
  ('ayrtam-atyrau', 'Айртам', 'Айртам', 'atyrau'),
  ('azgir-atyrau', 'Азгир', 'Азгир', 'atyrau'),
  ('balkuduk-atyrau', 'Балкудук', 'Балкудук', 'atyrau'),
  ('birlik-atyrau', 'Бирлик', 'Бирлик', 'atyrau'),
  ('damba-atyrau', 'Дамба', 'Дамба', 'atyrau'),
  ('kamynin-atyrau', 'Камынин', 'Камынин', 'atyrau'),
  ('karasyr-atyrau', 'Карасыр', 'Карасыр', 'atyrau'),
  ('kazbek-atyrau', 'Казбек', 'Казбек', 'atyrau'),
  ('koschagyl-atyrau', 'Косчагыл', 'Косчагыл', 'atyrau'),
  ('mahambet-atyrau', 'Махамбет', 'Махамбет', 'atyrau'),
  ('novobogatinskoe-atyrau', 'Новобогатинское', 'Новобогатинское', 'atyrau'),
  ('novyy-ushtagan-atyrau', 'Новый Уштаган', 'Новый Уштаган', 'atyrau'),
  ('orpa-atyrau', 'Орпа', 'Орпа', 'atyrau'),
  ('peshnoy-atyrau', 'Пешной', 'Пешной', 'atyrau'),
  ('sagiz-atyrau', 'Сагиз', 'Сагиз', 'atyrau'),
  ('shokpartogay-atyrau', 'Шокпартогай', 'Шокпартогай', 'atyrau'),
  ('tandau-atyrau', 'Тандау', 'Тандау', 'atyrau'),
  ('tas-atyrau', 'Тас', 'Тас', 'atyrau'),
  ('tolegen-atyrau', 'Толеген', 'Толеген', 'atyrau'),
  ('zhanbay-atyrau', 'Жанбай', 'Жанбай', 'atyrau'),
  ('zhalgyzapan-atyrau', 'Жалгызапан', 'Жалгызапан', 'atyrau'),
  ('zhaskayrat-atyrau', 'Жаскайрат', 'Жаскайрат', 'atyrau'),
  ('kurmangazy-atyrau', 'Курмангазы', 'Курмангазы', 'atyrau')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- east-kazakhstan (34)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('aksuat-east-kazakhstan', 'Аксуат', 'Аксуат', 'east-kazakhstan'),
  ('akzhal-east-kazakhstan', 'Акжал', 'Акжал', 'east-kazakhstan'),
  ('ayagoz-east-kazakhstan', 'Аягоз', 'Аягоз', 'east-kazakhstan'),
  ('bahty-east-kazakhstan', 'Бахты', 'Бахты', 'east-kazakhstan'),
  ('belagash-east-kazakhstan', 'Белагаш', 'Белагаш', 'east-kazakhstan'),
  ('boko-east-kazakhstan', 'Боко', 'Боко', 'east-kazakhstan'),
  ('cherdoyak-east-kazakhstan', 'Чердояк', 'Чердояк', 'east-kazakhstan'),
  ('chubartau-east-kazakhstan', 'Чубартау', 'Чубартау', 'east-kazakhstan'),
  ('donenbay-east-kazakhstan', 'Доненбай', 'Доненбай', 'east-kazakhstan'),
  ('karaaul-east-kazakhstan', 'Карааул', 'Карааул', 'east-kazakhstan'),
  ('karabulak-east-kazakhstan', 'Карабулак', 'Карабулак', 'east-kazakhstan'),
  ('karaguzhiha-east-kazakhstan', 'Карагужиха', 'Карагужиха', 'east-kazakhstan'),
  ('karatan-east-kazakhstan', 'Каратан', 'Каратан', 'east-kazakhstan'),
  ('kyzylogiz-east-kazakhstan', 'Кызылогиз', 'Кызылогиз', 'east-kazakhstan'),
  ('leninogorsk-east-kazakhstan', 'Лениногорск', 'Лениногорск', 'east-kazakhstan'),
  ('rahmanovskoe-east-kazakhstan', 'Рахмановское', 'Рахмановское', 'east-kazakhstan'),
  ('shemonaiha-east-kazakhstan', 'Шемонаиха', 'Шемонаиха', 'east-kazakhstan'),
  ('sotsial-east-kazakhstan', 'Социал', 'Социал', 'east-kazakhstan'),
  ('taskesken-east-kazakhstan', 'Таскескен', 'Таскескен', 'east-kazakhstan'),
  ('urdzhar-east-kazakhstan', 'Урджар', 'Урджар', 'east-kazakhstan'),
  ('uryl-east-kazakhstan', 'Урыль', 'Урыль', 'east-kazakhstan'),
  ('zaysan-east-kazakhstan', 'Зайсан', 'Зайсан', 'east-kazakhstan'),
  ('zharma-east-kazakhstan', 'Жарма', 'Жарма', 'east-kazakhstan'),
  ('znamenka-east-kazakhstan', 'Знаменка', 'Знаменка', 'east-kazakhstan'),
  ('zyryanovsk-east-kazakhstan', 'Зыряновск', 'Зыряновск', 'east-kazakhstan'),
  ('sergeevka-east-kazakhstan', 'Сергеевка', 'Сергеевка', 'east-kazakhstan'),
  ('praporschikovo-east-kazakhstan', 'Прапорщиково', 'Прапорщиково', 'east-kazakhstan'),
  ('ukrainka-east-kazakhstan', 'Украинка', 'Украинка', 'east-kazakhstan'),
  ('uvarovo-east-kazakhstan', 'Уварово', 'Уварово', 'east-kazakhstan'),
  ('glubokoe-east-kazakhstan', 'Глубокое', 'Глубокое', 'east-kazakhstan'),
  ('belousovka-east-kazakhstan', 'Белоусовка', 'Белоусовка', 'east-kazakhstan'),
  ('bobrovka-glubokovskiy-rayon-east-kazakhstan', 'Бобровка (Глубоковский район)', 'Бобровка (Глубоковский район)', 'east-kazakhstan'),
  ('vinnoe-east-kazakhstan', 'Винное', 'Винное', 'east-kazakhstan'),
  ('sekisovka-east-kazakhstan', 'Секисовка', 'Секисовка', 'east-kazakhstan')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- zhambyl (23)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('akzhar-zhambyl', 'Акжар', 'Акжар', 'zhambyl'),
  ('algatart-zhambyl', 'Алгатарт', 'Алгатарт', 'zhambyl'),
  ('chu-zhambyl', 'Чу', 'Чу', 'zhambyl'),
  ('moyynkum-zhambyl', 'Мойынкум', 'Мойынкум', 'zhambyl'),
  ('kamkaly-zhambyl', 'Камкалы', 'Камкалы', 'zhambyl'),
  ('karatau-zhambyl', 'Каратау', 'Каратау', 'zhambyl'),
  ('mynaral-zhambyl', 'Мынарал', 'Мынарал', 'zhambyl'),
  ('otar-zhambyl', 'Отар', 'Отар', 'zhambyl'),
  ('uyuk-zhambyl', 'Уюк', 'Уюк', 'zhambyl'),
  ('zhanatas-zhambyl', 'Жанатас', 'Жанатас', 'zhambyl'),
  ('merke-zhambyl', 'Мерке', 'Мерке', 'zhambyl'),
  ('chaldovar-zhambyl', 'Чалдовар', 'Чалдовар', 'zhambyl'),
  ('zhambul-merke-r-n-zhambyl', 'Жамбул (Мерке р.н)', 'Жамбул (Мерке р.н)', 'zhambyl'),
  ('internatsional-noe-zhambyl', 'Интернациональное', 'Интернациональное', 'zhambyl'),
  ('oytal-zhambyl', 'Ойтал', 'Ойтал', 'zhambyl'),
  ('tatti-zhambyl', 'Татти', 'Татти', 'zhambyl'),
  ('kazah-zhambyl', 'Казах', 'Казах', 'zhambyl'),
  ('lugovoy-zhambyl', 'Луговой', 'Луговой', 'zhambyl'),
  ('kulan-zhambyl', 'Кулан', 'Кулан', 'zhambyl'),
  ('kogershin-zhambyl', 'Когершин', 'Когершин', 'zhambyl'),
  ('akyrtobe-zhambyl', 'Акыртобе', 'Акыртобе', 'zhambyl'),
  ('ornek-ryskulov-r-n-zhambyl', 'Орнек (Рыскулов р.н)', 'Орнек (Рыскулов р.н)', 'zhambyl'),
  ('bauyrzhan-momyshuly-zhambyl', 'Бауыржан Момышулы', 'Бауыржан Момышулы', 'zhambyl')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- west-kazakhstan (24)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('aksu-west-kazakhstan', 'Аксу', 'Аксу', 'west-kazakhstan'),
  ('kayyndy-west-kazakhstan', 'Кайынды', 'Кайынды', 'west-kazakhstan'),
  ('bitik-west-kazakhstan', 'Битик', 'Битик', 'west-kazakhstan'),
  ('bolashak-kaztalov-west-kazakhstan', 'Болашак (Казталов)', 'Болашак (Казталов)', 'west-kazakhstan'),
  ('boget-west-kazakhstan', 'Богет', 'Богет', 'west-kazakhstan'),
  ('bostandyk-west-kazakhstan', 'Бостандык', 'Бостандык', 'west-kazakhstan'),
  ('buldyrty-west-kazakhstan', 'Булдырты', 'Булдырты', 'west-kazakhstan'),
  ('chapaev-west-kazakhstan', 'Чапаев', 'Чапаев', 'west-kazakhstan'),
  ('chizha-2-west-kazakhstan', 'Чижа-2', 'Чижа-2', 'west-kazakhstan'),
  ('dzhambeyty-west-kazakhstan', 'Джамбейты', 'Джамбейты', 'west-kazakhstan'),
  ('sarykol-west-kazakhstan', 'Сарыколь', 'Сарыколь', 'west-kazakhstan'),
  ('zhalpaktal-west-kazakhstan', 'Жалпактал', 'Жалпактал', 'west-kazakhstan'),
  ('taypak-west-kazakhstan', 'Тайпак', 'Тайпак', 'west-kazakhstan'),
  ('kaztalovka-west-kazakhstan', 'Казталовка', 'Казталовка', 'west-kazakhstan'),
  ('akshat-west-kazakhstan', 'Акшат', 'Акшат', 'west-kazakhstan'),
  ('masteksay-west-kazakhstan', 'Мастексай', 'Мастексай', 'west-kazakhstan'),
  ('mergenevo-west-kazakhstan', 'Мергенево', 'Мергенево', 'west-kazakhstan'),
  ('zhanakazan-west-kazakhstan', 'Жанаказан', 'Жанаказан', 'west-kazakhstan'),
  ('ashysay-west-kazakhstan', 'Ашысай', 'Ашысай', 'west-kazakhstan'),
  ('sergey-aula-west-kazakhstan', 'Сергей Аула', 'Сергей Аула', 'west-kazakhstan'),
  ('shalkar-west-kazakhstan', 'Шалкар', 'Шалкар', 'west-kazakhstan'),
  ('akkuray-west-kazakhstan', 'Аккурай', 'Аккурай', 'west-kazakhstan'),
  ('tau-west-kazakhstan', 'Тау', 'Тау', 'west-kazakhstan'),
  ('zhetybay-west-kazakhstan', 'Жетыбай', 'Жетыбай', 'west-kazakhstan')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- karaganda (37)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('abay-karaganda', 'Абай', 'Абай', 'karaganda'),
  ('agadyr-karaganda', 'Агадырь', 'Агадырь', 'karaganda'),
  ('aktas-karaganda', 'Актас', 'Актас', 'karaganda'),
  ('aktogay-karaganda', 'Актогай', 'Актогай', 'karaganda'),
  ('aktuma-karaganda', 'Актума', 'Актума', 'karaganda'),
  ('ayshyrak-karaganda', 'Айшырак', 'Айшырак', 'karaganda'),
  ('balhash-karaganda', 'Балхаш', 'Балхаш', 'karaganda'),
  ('karazhal-karaganda', 'Каражал', 'Каражал', 'karaganda'),
  ('karazhyngyl-karaganda', 'Каражынгыл', 'Каражынгыл', 'karaganda'),
  ('karkaralinsk-karaganda', 'Каркаралинск', 'Каркаралинск', 'karaganda'),
  ('karsakbay-karaganda', 'Карсакбай', 'Карсакбай', 'karaganda'),
  ('kense-karaganda', 'Кенсе', 'Кенсе', 'karaganda'),
  ('kievka-karaganda', 'Киевка', 'Киевка', 'karaganda'),
  ('kurgasyn-karaganda', 'Кургасын', 'Кургасын', 'karaganda'),
  ('kyzyldikan-karaganda', 'Кызылдикан', 'Кызылдикан', 'karaganda'),
  ('kyzyl-dzhar-karaganda', 'Кызыл-Джар', 'Кызыл-Джар', 'karaganda'),
  ('kyzyl-kommuna-karaganda', 'Кызыл коммуна', 'Кызыл коммуна', 'karaganda'),
  ('kyzyltau-karaganda', 'Кызылтау', 'Кызылтау', 'karaganda'),
  ('kyzyluy-karaganda', 'Кызылуй', 'Кызылуй', 'karaganda'),
  ('mointy-karaganda', 'Моинты', 'Моинты', 'karaganda'),
  ('satpaev-karaganda', 'Сатпаев', 'Сатпаев', 'karaganda'),
  ('nura-karaganda', 'Нура', 'Нура', 'karaganda'),
  ('saran-karaganda', 'Сарань', 'Сарань', 'karaganda'),
  ('sary-shagan-karaganda', 'Сары-Шаган', 'Сары-Шаган', 'karaganda'),
  ('sayak-karaganda', 'Саяк', 'Саяк', 'karaganda'),
  ('shahtinsk-karaganda', 'Шахтинск', 'Шахтинск', 'karaganda'),
  ('shalgiya-karaganda', 'Шалгия', 'Шалгия', 'karaganda'),
  ('sonaly-karaganda', 'Соналы', 'Соналы', 'karaganda'),
  ('sorolen-karaganda', 'Соролен', 'Соролен', 'karaganda'),
  ('tan-karaganda', 'Тан', 'Тан', 'karaganda'),
  ('tasaral-karaganda', 'Тасарал', 'Тасарал', 'karaganda'),
  ('torabay-karaganda', 'Торабай', 'Торабай', 'karaganda'),
  ('uspenskiy-karaganda', 'Успенский', 'Успенский', 'karaganda'),
  ('egindybulak-karaganda', 'Егиндыбулак', 'Егиндыбулак', 'karaganda'),
  ('zhanteli-karaganda', 'Жантели', 'Жантели', 'karaganda'),
  ('shahan-karaganda', 'Шахан', 'Шахан', 'karaganda'),
  ('karazhar-karaganda', 'Каражар', 'Каражар', 'karaganda')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- kostanay (15)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('tamkamys-kostanay', 'Тамкамыс', 'Тамкамыс', 'kostanay'),
  ('turgay-kostanay', 'Тургай', 'Тургай', 'kostanay'),
  ('akshy-kostanay', 'Акшы', 'Акшы', 'kostanay'),
  ('amangel-dy-kostanay', 'Амангельды', 'Амангельды', 'kostanay'),
  ('arkalyk-kostanay', 'Аркалык', 'Аркалык', 'kostanay'),
  ('birali-kostanay', 'Бирали', 'Бирали', 'kostanay'),
  ('dzhetygara-kostanay', 'Джетыгара', 'Джетыгара', 'kostanay'),
  ('kokalat-kostanay', 'Кокалат', 'Кокалат', 'kostanay'),
  ('kyzylzhar-kostanay', 'Кызылжар', 'Кызылжар', 'kostanay'),
  ('presnogor-kovka-kostanay', 'Пресногорьковка', 'Пресногорьковка', 'kostanay'),
  ('saga-kostanay', 'Сага', 'Сага', 'kostanay'),
  ('shenber-kostanay', 'Шенбер', 'Шенбер', 'kostanay'),
  ('frunzenskoe-kostanay', 'Фрунзенское', 'Фрунзенское', 'kostanay'),
  ('rudnyy-kostanay', 'Рудный', 'Рудный', 'kostanay'),
  ('ayatskoe-kostanay', 'Аятское', 'Аятское', 'kostanay')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- kyzylorda (22)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('uzynkayyr-kyzylorda', 'Узынкайыр', 'Узынкайыр', 'kyzylorda'),
  ('baykonur-kyzylorda', 'Байконур', 'Байконур', 'kyzylorda'),
  ('akkespe-kyzylorda', 'Аккеспе', 'Аккеспе', 'kyzylorda'),
  ('aral-sk-kyzylorda', 'Аральск', 'Аральск', 'kyzylorda'),
  ('zhaksykylysh-kyzylorda', 'Жаксыкылыш', 'Жаксыкылыш', 'kyzylorda'),
  ('auan-kyzylorda', 'Ауан', 'Ауан', 'kyzylorda'),
  ('aydarly-kyzylorda', 'Айдарлы', 'Айдарлы', 'kyzylorda'),
  ('baygekum-kyzylorda', 'Байгекум', 'Байгекум', 'kyzylorda'),
  ('chiili-kyzylorda', 'Чиили', 'Чиили', 'kyzylorda'),
  ('diermen-tobe-kyzylorda', 'Диермен тобе', 'Диермен тобе', 'kyzylorda'),
  ('dzhusaly-kyzylorda', 'Джусалы', 'Джусалы', 'kyzylorda'),
  ('erimbet-kyzylorda', 'Еримбет', 'Еримбет', 'kyzylorda'),
  ('kaskakulan-kyzylorda', 'Каскакулан', 'Каскакулан', 'kyzylorda'),
  ('kazalinsk-kyzylorda', 'Казалинск', 'Казалинск', 'kyzylorda'),
  ('kulandy-kyzylorda', 'Куланды', 'Куланды', 'kyzylorda'),
  ('ayteke-bi-kyzylorda', 'Айтеке-Би', 'Айтеке-Би', 'kyzylorda'),
  ('saksaul-skiy-kyzylorda', 'Саксаульский', 'Саксаульский', 'kyzylorda'),
  ('sulutobe-kyzylorda', 'Сулутобе', 'Сулутобе', 'kyzylorda'),
  ('teren-ozek-kyzylorda', 'Терен-Озек', 'Терен-Озек', 'kyzylorda'),
  ('zhana-korgan-kyzylorda', 'Жана-Корган', 'Жана-Корган', 'kyzylorda'),
  ('besaryk-kyzylorda', 'Бесарык', 'Бесарык', 'kyzylorda'),
  ('talap-kyzylorda', 'Талап', 'Талап', 'kyzylorda')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- mangystau (18)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('fort-shevchenko-mangystau', 'Форт-Шевченко', 'Форт-Шевченко', 'mangystau'),
  ('kul-tau-mangystau', 'Культау', 'Культау', 'mangystau'),
  ('kuyushe-mangystau', 'Куюше', 'Куюше', 'mangystau'),
  ('mangyshlak-mangystau', 'Мангышлак', 'Мангышлак', 'mangystau'),
  ('zhanaozen-mangystau', 'Жанаозен', 'Жанаозен', 'mangystau'),
  ('borankul-st-opornaya-mangystau', 'Боранкул (Ст. Опорная)', 'Боранкул (Ст. Опорная)', 'mangystau'),
  ('saura-mangystau', 'Саура', 'Саура', 'mangystau'),
  ('say-otes-mangystau', 'Сай Отес', 'Сай Отес', 'mangystau'),
  ('saina-shapagatova-mangystau', 'Саина Шапагатова', 'Саина Шапагатова', 'mangystau'),
  ('shetpe-mangystau', 'Шетпе', 'Шетпе', 'mangystau'),
  ('tauchik-mangystau', 'Таучик', 'Таучик', 'mangystau'),
  ('ushtagan-mangystau', 'Уштаган', 'Уштаган', 'mangystau'),
  ('imeni-kalinina-mangystau', 'Имени Калинина', 'Имени Калинина', 'mangystau'),
  ('bautino-mangystau', 'Баутино', 'Баутино', 'mangystau'),
  ('kyzyk-mangystau', 'Кызык', 'Кызык', 'mangystau'),
  ('kuryk-mangystau', 'Курык', 'Курык', 'mangystau'),
  ('eralieva-mangystau', 'Ералиева', 'Ералиева', 'mangystau'),
  ('zhyngyldy-kuybyshevo-mangystau', 'Жынгылды (Куйбышево)', 'Жынгылды (Куйбышево)', 'mangystau')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- pavlodar (1)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('alekseevka-pavlodar', 'Алексеевка', 'Алексеевка', 'pavlodar')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- north-kazakhstan (14)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('bogolyubovo-north-kazakhstan', 'Боголюбово', 'Боголюбово', 'north-kazakhstan'),
  ('bulaevo-north-kazakhstan', 'Булаево', 'Булаево', 'north-kazakhstan'),
  ('dubrovnoe-north-kazakhstan', 'Дубровное', 'Дубровное', 'north-kazakhstan'),
  ('kaban-north-kazakhstan', 'Кабан', 'Кабан', 'north-kazakhstan'),
  ('kara-kuga-north-kazakhstan', 'Кара-Куга', 'Кара-Куга', 'north-kazakhstan'),
  ('mamlyutka-north-kazakhstan', 'Мамлютка', 'Мамлютка', 'north-kazakhstan'),
  ('nalobino-north-kazakhstan', 'Налобино', 'Налобино', 'north-kazakhstan'),
  ('novonikol-skoe-north-kazakhstan', 'Новоникольское', 'Новоникольское', 'north-kazakhstan'),
  ('novopokrovka-north-kazakhstan', 'Новопокровка', 'Новопокровка', 'north-kazakhstan'),
  ('poludino-north-kazakhstan', 'Полудино', 'Полудино', 'north-kazakhstan'),
  ('presnovka-north-kazakhstan', 'Пресновка', 'Пресновка', 'north-kazakhstan'),
  ('sokolovka-north-kazakhstan', 'Соколовка', 'Соколовка', 'north-kazakhstan'),
  ('ekatrinovka-north-kazakhstan', 'Екатриновка', 'Екатриновка', 'north-kazakhstan'),
  ('kyzylagash-north-kazakhstan', 'Кызылагаш', 'Кызылагаш', 'north-kazakhstan')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;

-- turkistan (45)
insert into public.cities (slug, name_ru, name_kk, region_id)
select v.slug, v.name_ru, v.name_kk, r.id
from (values
  ('aksumbe-turkistan', 'Аксумбе', 'Аксумбе', 'turkistan'),
  ('arys-turkistan', 'Арысь', 'Арысь', 'turkistan'),
  ('bagara-turkistan', 'Bagara', 'Bagara', 'turkistan'),
  ('bairkum-turkistan', 'Баиркум', 'Баиркум', 'turkistan'),
  ('bayzhansay-turkistan', 'Байжансай', 'Байжансай', 'turkistan'),
  ('chardara-turkistan', 'Чардара', 'Чардара', 'turkistan'),
  ('chulakkurgan-turkistan', 'Чулаккурган', 'Чулаккурган', 'turkistan'),
  ('fogolevo-turkistan', 'Фоголево', 'Фоголево', 'turkistan'),
  ('koksaray-turkistan', 'Коксарай', 'Коксарай', 'turkistan'),
  ('saryagash-turkistan', 'Сарыагаш', 'Сарыагаш', 'turkistan'),
  ('suzak-turkistan', 'Сузак', 'Сузак', 'turkistan'),
  ('tasty-turkistan', 'Тасты', 'Тасты', 'turkistan'),
  ('zhetysay-turkistan', 'Жетысай', 'Жетысай', 'turkistan'),
  ('otrar-turkistan', 'Отрар', 'Отрар', 'turkistan'),
  ('karashik-turkistan', 'Карашик', 'Карашик', 'turkistan'),
  ('kushata-turkistan', 'Кушата', 'Кушата', 'turkistan'),
  ('bayaldyr-turkistan', 'Баялдыр', 'Баялдыр', 'turkistan'),
  ('bostandyk-urangay-s-o-turkistan', 'Бостандык (Урангай С.О)', 'Бостандык (Урангай С.О)', 'turkistan'),
  ('urangay-turkistan', 'Урангай', 'Урангай', 'turkistan'),
  ('shipan-turkistan', 'Шипан', 'Шипан', 'turkistan'),
  ('kommuna-turkistan', 'Коммуна', 'Коммуна', 'turkistan'),
  ('kyzylzhol-turkistan', 'Кызылжол', 'Кызылжол', 'turkistan'),
  ('karnak-turkistan', 'Карнак', 'Карнак', 'turkistan'),
  ('shashtobe-turkistan', 'Шаштобе', 'Шаштобе', 'turkistan'),
  ('kumaylykas-turkistan', 'Кумайлыкас', 'Кумайлыкас', 'turkistan'),
  ('sert-turkistan', 'Серт', 'Серт', 'turkistan'),
  ('barisovka-turkistan', 'Барисовка', 'Барисовка', 'turkistan'),
  ('shubanak-turkistan', 'Шубанак', 'Шубанак', 'turkistan'),
  ('staroikan-turkistan', 'Староикан', 'Староикан', 'turkistan'),
  ('ittifak-turkistan', 'Иттифак', 'Иттифак', 'turkistan'),
  ('teke-turkistan', 'Теке', 'Теке', 'turkistan'),
  ('30-let-kazahstana-turkistan', '30 лет Казахстана', '30 лет Казахстана', 'turkistan'),
  ('ibata-turkistan', 'Ибата', 'Ибата', 'turkistan'),
  ('sauran-turkistan', 'Сауран', 'Сауран', 'turkistan'),
  ('zhana-sauran-turkistan', 'Жана Сауран', 'Жана Сауран', 'turkistan'),
  ('babaykurgan-turkistan', 'Бабайкурган', 'Бабайкурган', 'turkistan'),
  ('lenger-turkistan', 'Ленгер', 'Ленгер', 'turkistan'),
  ('turar-ryskulov-turkistan', 'Турар Рыскулов', 'Турар Рыскулов', 'turkistan'),
  ('sastobe-turkistan', 'Састобе', 'Састобе', 'turkistan'),
  ('zhaskeshu-turkistan', 'Жаскешу', 'Жаскешу', 'turkistan'),
  ('karabulak-turkistan', 'Карабулак', 'Карабулак', 'turkistan'),
  ('tortkol-turkistan', 'Тортколь', 'Тортколь', 'turkistan'),
  ('kazygurt-turkistan', 'Казыгурт', 'Казыгурт', 'turkistan'),
  ('shaul-der-turkistan', 'Шаульдер', 'Шаульдер', 'turkistan'),
  ('temirlanovka-turkistan', 'Темирлановка', 'Темирлановка', 'turkistan')
) as v(slug, name_ru, name_kk, region_slug)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do nothing;
