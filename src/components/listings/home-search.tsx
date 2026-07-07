'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Category {
	id: number;
	slug: string;
	kind: 'pets' | 'livestock' | 'goods' | 'services' | 'events';
	name_ru: string;
	name_kk: string;
}

interface Region {
	id: number;
	name_ru: string;
	name_kk: string;
}

interface Props {
	categories: Category[];
	regions: Region[];
	locale: string;
}

export function HomeSearch({ categories, regions, locale }: Props) {
	const t = useTranslations('listings');
	const tCommon = useTranslations('common');
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [q, setQ] = useState('');
	const [regionId, setRegionId] = useState<string>('all');
	const [categoryId, setCategoryId] = useState<string>('all');
	const [dealType, setDealType] = useState<string>('all');

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const selectableCategories = categories.filter((c) => c.kind !== 'events');

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (regionId !== 'all') params.set('regionId', regionId);
		if (categoryId !== 'all') params.set('categoryId', categoryId);
		if (dealType !== 'all') params.set('dealType', dealType);
		const qs = params.toString();
		startTransition(() => {
			router.push(`/listings${qs ? `?${qs}` : ''}` as never);
		});
	}

	return (
		<form
			onSubmit={submit}
			className="rounded-xl border bg-background p-3 shadow-sm md:p-4"
		>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
				<Select value={regionId} onValueChange={setRegionId}>
					<SelectTrigger className="h-10">
						<SelectValue placeholder={t('filters.location')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t('filters.location')}</SelectItem>
						{regions.map((r) => (
							<SelectItem key={r.id} value={String(r.id)}>
								{r[localeKey]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={categoryId} onValueChange={setCategoryId}>
					<SelectTrigger className="h-10">
						<SelectValue placeholder={t('filters.category')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t('filters.category')}</SelectItem>
						{selectableCategories.map((c) => (
							<SelectItem key={c.id} value={String(c.id)}>
								{c[localeKey]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={dealType} onValueChange={setDealType}>
					<SelectTrigger className="h-10">
						<SelectValue placeholder={t('filters.dealType')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t('filters.dealType')}</SelectItem>
						<SelectItem value="sale">{t('dealTypes.sale')}</SelectItem>
						<SelectItem value="gift">{t('dealTypes.gift')}</SelectItem>
						<SelectItem value="exchange">{t('dealTypes.exchange')}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder={t('filters.searchByWords')}
						className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</div>
				<Button type="submit" size="lg" disabled={isPending} className="h-11">
					{tCommon('search')}
				</Button>
			</div>
		</form>
	);
}
