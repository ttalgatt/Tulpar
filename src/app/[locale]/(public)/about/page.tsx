import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
	PawPrint,
	Beef,
	ShoppingBag,
	CalendarDays,
	Search,
	Globe,
	ShieldCheck,
	Banknote,
} from 'lucide-react';

export const metadata: Metadata = {
	title: 'О проекте — Бұзау',
	description:
		'Бұзау — казахстанский маркетплейс для купли-продажи домашних животных, скота, товаров и услуг',
};

const categories = {
	ru: [
		{
			icon: PawPrint,
			title: 'Домашние животные',
			desc: 'Кошки, собаки, птицы, грызуны и экзотика',
		},
		{
			icon: Beef,
			title: 'Скот и птица',
			desc: 'КРС, лошади, овцы, козы — в том числе оптом и табунами',
		},
		{
			icon: ShoppingBag,
			title: 'Товары и услуги',
			desc: 'Корма, уход, ветеринария, кинологи и зоосалоны',
		},
		{
			icon: CalendarDays,
			title: 'События',
			desc: 'Выставки, соревнования, ярмарки и другие мероприятия',
		},
	],
	kk: [
		{
			icon: PawPrint,
			title: 'Үй жануарлары',
			desc: 'Мысықтар, иттер, құстар, кемірушілер және экзотикалық жануарлар',
		},
		{
			icon: Beef,
			title: 'Мал және құс',
			desc: 'ІҚМ, жылқылар, қойлар, ешкілер — оның ішінде жаппай және үйір-үйірімен',
		},
		{
			icon: ShoppingBag,
			title: 'Тауарлар мен қызметтер',
			desc: 'Жем, күтім, ветеринария, кинологтар және зоосалондар',
		},
		{
			icon: CalendarDays,
			title: 'Іс-шаралар',
			desc: 'Көрмелер, жарыстар, жәрмеңкелер және басқа да шаралар',
		},
	],
};

const advantages = {
	ru: [
		{ icon: Banknote, title: 'Бесплатно', desc: 'Размещение объявлений без скрытых платежей' },
		{ icon: Globe, title: 'Два языка', desc: 'Интерфейс на русском и казахском языках' },
		{ icon: Search, title: 'Удобный поиск', desc: 'Фильтры по виду, региону, цене и типу сделки' },
		{ icon: ShieldCheck, title: 'Модерация', desc: 'Все объявления проверяются перед публикацией' },
	],
	kk: [
		{ icon: Banknote, title: 'Тегін', desc: 'Жасырын төлемсіз хабарландыру орналастыру' },
		{ icon: Globe, title: 'Екі тілде', desc: 'Интерфейс қазақ және орыс тілдерінде' },
		{ icon: Search, title: 'Ыңғайлы іздеу', desc: 'Түр, аймақ, баға және мәміле түрі бойынша сүзгілер' },
		{ icon: ShieldCheck, title: 'Модерация', desc: 'Барлық хабарландырулар жариялаудан бұрын тексеріледі' },
	],
};

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const isKk = locale === 'kk';
	const cats = isKk ? categories.kk : categories.ru;
	const advs = isKk ? advantages.kk : advantages.ru;

	return (
		<div className="container py-12 max-w-4xl space-y-20">

			{/* Миссия */}
			<section className="text-center space-y-5">
				<h1 className="text-4xl font-bold tracking-tight">
					{isKk ? 'Бұзау туралы' : 'О проекте'}
				</h1>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					{isKk
						? 'Бұзау — Қазақстандағы жануарлар мен мал саудасына арналған хабарландырулар платформасы. Мұнда үй жануарын, ауыл шаруашылығы малын, жем немесе зооқызметтерді жылдам табуға немесе сатуға болады.'
						: 'Бұзау — казахстанская платформа объявлений, созданная специально для торговли животными и всем, что с ними связано. Здесь можно быстро найти или продать домашнего питомца, сельскохозяйственный скот, корма или зоо-услуги.'}
				</p>

				{/* Смысл названия */}
				<div className="inline-block rounded-2xl bg-primary/8 border border-primary/20 px-6 py-4 text-sm text-muted-foreground max-w-xl mx-auto">
					{isKk
						? '«Бұзау» — қазақ тілінде «бұзау» деген сөз, жас, тіршілікке толы жан. Платформаның атауы өсу, жаңарту және тіршілік идеясын бейнелейді.'
						: '«Бұзау» в переводе с казахского — телёнок. Название отражает идею роста, молодости и жизни — всё то, что мы хотим воплотить в платформе.'}
				</div>
			</section>

			{/* Категории */}
			<section>
				<h2 className="text-2xl font-semibold mb-8 text-center">
					{isKk ? 'Платформада не таба аласыз' : 'Что можно найти на сайте'}
				</h2>
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{cats.map(({ icon: Icon, title, desc }) => (
						<div
							key={title}
							className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-sm transition-shadow"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="font-semibold text-sm">{title}</div>
								<div className="text-xs text-muted-foreground mt-1">{desc}</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Преимущества */}
			<section>
				<h2 className="text-2xl font-semibold mb-8 text-center">
					{isKk ? 'Неліктен Бұзау?' : 'Почему Бұзау?'}
				</h2>
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{advs.map(({ icon: Icon, title, desc }) => (
						<div key={title} className="flex gap-3">
							<div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
								<Icon className="h-4 w-4 text-accent-foreground" />
							</div>
							<div>
								<div className="font-semibold text-sm">{title}</div>
								<div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="text-center space-y-4 py-4">
				<p className="text-muted-foreground">
					{isKk
						? 'Қосылыңыз — тіркелу тегін және 1 минут алады.'
						: 'Присоединяйтесь — регистрация бесплатна и займёт 1 минуту.'}
				</p>
				<div className="flex flex-wrap gap-3 justify-center">
					<Button asChild size="lg">
						<Link href="/listings/new">
							{isKk ? 'Хабарландыру орналастыру' : 'Разместить объявление'}
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/listings">
							{isKk ? 'Хабарландыруларды қарау' : 'Смотреть объявления'}
						</Link>
					</Button>
				</div>
			</section>

		</div>
	);
}
