import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null, currency = 'KZT', locale = 'ru-KZ') {
	if (price === null || price === undefined) return null;
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(price);
}

export function formatDate(date: string | Date, locale = 'ru-RU') {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(locale, {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	}).format(d);
}

export function formatRelativeDate(date: string | Date, locale = 'ru-RU') {
	const d = typeof date === 'string' ? new Date(date) : date;
	const diff = Date.now() - d.getTime();
	const minutes = Math.floor(diff / 60_000);
	const hours = Math.floor(diff / 3_600_000);
	const days = Math.floor(diff / 86_400_000);
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	if (minutes < 1) return rtf.format(0, 'minute');
	if (minutes < 60) return rtf.format(-minutes, 'minute');
	if (hours < 24) return rtf.format(-hours, 'hour');
	if (days < 30) return rtf.format(-days, 'day');
	return formatDate(d, locale);
}

/**
 * Форматирует возраст из месяцев в читаемую строку.
 * Примеры: 1 → "1 мес.", 14 → "1 год 2 мес.", 24 → "2 года", 60 → "5 лет"
 */
export function formatAge(months: number, locale = 'ru'): string {
	if (months < 0) return '';
	const years = Math.floor(months / 12);
	const remainMonths = months % 12;

	if (locale === 'kk') {
		const parts: string[] = [];
		if (years > 0) parts.push(`${years} жыл`);
		if (remainMonths > 0) parts.push(`${remainMonths} ай`);
		return parts.join(' ') || '0 ай';
	}

	// ru locale — plurals
	function pluralRu(n: number, one: string, few: string, many: string): string {
		const mod10 = n % 10;
		const mod100 = n % 100;
		if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
		return `${n} ${many}`;
	}

	const parts: string[] = [];
	if (years > 0) parts.push(pluralRu(years, 'год', 'года', 'лет'));
	if (remainMonths > 0) parts.push(pluralRu(remainMonths, 'мес.', 'мес.', 'мес.'));
	return parts.join(' ') || '0 мес.';
}

export function slugify(input: string) {
	const map: Record<string, string> = {
		а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
		и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
		с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
		ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
		ә: 'a', ғ: 'g', қ: 'q', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
	};
	return input
		.toLowerCase()
		.split('')
		.map((c) => map[c] ?? c)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80);
}
