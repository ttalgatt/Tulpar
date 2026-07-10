'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { createClient } from '@/lib/supabase/client';
import { Search, X } from 'lucide-react';

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

interface City {
	id: number;
	region_id: number;
	name_ru: string;
	name_kk: string;
}

interface District {
	id: number;
	city_id: number;
	name_ru: string;
	name_kk: string;
}

interface Filters {
	q?: string;
	kind?: 'pets' | 'livestock' | 'goods' | 'services';
	categoryId?: number;
	regionId?: number;
	cityId?: number;
	districtId?: number;
	priceMin?: number;
	priceMax?: number;
	ageMin?: number;
	ageMax?: number;
	dealType?: 'sale' | 'gift' | 'exchange';
	sort?: 'newest' | 'priceAsc' | 'priceDesc';
}

interface Props {
	categories: Category[];
	regions: Region[];
	locale: string;
	initial: Filters;
}

export function ListingFilters({ categories, regions, locale, initial }: Props) {
	const t = useTranslations('listings');
	const tCommon = useTranslations('common');
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const [q, setQ] = useState(initial.q ?? '');
	const [kind, setKind] = useState<Filters['kind']>(initial.kind);
	const [categoryId, setCategoryId] = useState(initial.categoryId);
	const [regionId, setRegionId] = useState(initial.regionId);
	const [cityId, setCityId] = useState(initial.cityId);
	const [districtId, setDistrictId] = useState(initial.districtId);
	const [priceMin, setPriceMin] = useState(initial.priceMin?.toString() ?? '');
	const [priceMax, setPriceMax] = useState(initial.priceMax?.toString() ?? '');
	const [ageMin, setAgeMin] = useState(initial.ageMin?.toString() ?? '');
	const [ageMax, setAgeMax] = useState(initial.ageMax?.toString() ?? '');
	const [dealType, setDealType] = useState(initial.dealType);
	const [sort, setSort] = useState<Filters['sort']>(initial.sort ?? 'newest');
	const [cities, setCities] = useState<City[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';

	useEffect(() => {
		if (!regionId) {
			setCities([]);
			return;
		}
		const supabase = createClient();
		supabase
			.from('cities')
			.select('*')
			.eq('region_id', regionId)
			.order('name_ru')
			.then(({ data }) => setCities((data as City[]) ?? []));
	}, [regionId]);

	useEffect(() => {
		if (!cityId) {
			setDistricts([]);
			return;
		}
		const supabase = createClient();
		supabase
			.from('districts')
			.select('*')
			.eq('city_id', cityId)
			.order('name_ru')
			.then(({ data }) => setDistricts((data as District[]) ?? []));
	}, [cityId]);

	function apply() {
		const params = new URLSearchParams();
		if (q) params.set('q', q);
		if (kind) params.set('kind', kind);
		if (categoryId) params.set('categoryId', String(categoryId));
		if (regionId) params.set('regionId', String(regionId));
		if (cityId) params.set('cityId', String(cityId));
		if (districtId) params.set('districtId', String(districtId));
		if (priceMin) params.set('priceMin', priceMin);
		if (priceMax) params.set('priceMax', priceMax);
		if (ageMin) params.set('ageMin', ageMin);
		if (ageMax) params.set('ageMax', ageMax);
		if (dealType) params.set('dealType', dealType);
		if (sort && sort !== 'newest') params.set('sort', sort);
		const qs = params.toString();
		startTransition(() => {
			router.push(`${pathname}${qs ? `?${qs}` : ''}` as never);
		});
	}

	function reset() {
		setQ('');
		setKind(undefined);
		setCategoryId(undefined);
		setRegionId(undefined);
		setCityId(undefined);
		setDistrictId(undefined);
		setPriceMin('');
		setPriceMax('');
		setAgeMin('');
		setAgeMax('');
		setDealType(undefined);
		setSort('newest');
		startTransition(() => router.push(pathname as never));
	}

	const visibleCategories = kind ? categories.filter((c) => c.kind === kind) : categories;

	return (
		<Card>
			<CardContent className="space-y-4 p-4">
				<div className="space-y-2">
					<Label>{tCommon('search')}</Label>
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && apply()}
							placeholder={t('filters.title')}
							className="pl-9"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>{t('filters.category')}</Label>
					<Select
						value={categoryId ? String(categoryId) : 'all'}
						onValueChange={(v) => setCategoryId(v === 'all' ? undefined : Number(v))}
					>
						<SelectTrigger>
							<SelectValue placeholder={tCommon('all')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{tCommon('all')}</SelectItem>
							{visibleCategories.map((c) => (
								<SelectItem key={c.id} value={String(c.id)}>
									{c[localeKey]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>{t('filters.location')}</Label>
					<Select
						value={regionId ? String(regionId) : 'all'}
						onValueChange={(v) => {
							setRegionId(v === 'all' ? undefined : Number(v));
							setCityId(undefined);
							setDistrictId(undefined);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder={tCommon('all')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{tCommon('all')}</SelectItem>
							{regions.map((r) => (
								<SelectItem key={r.id} value={String(r.id)}>
									{r[localeKey]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{cities.length > 0 && (
						<SearchableSelect
							value={cityId ? String(cityId) : undefined}
							onValueChange={(v) => {
								setCityId(v ? Number(v) : undefined);
								setDistrictId(undefined);
							}}
							placeholder={t('fields.city')}
							clearLabel={tCommon('all')}
							options={cities.map((c) => ({
								value: String(c.id),
								label: c[localeKey],
							}))}
						/>
					)}
					{districts.length > 0 && (
						<Select
							value={districtId ? String(districtId) : 'all'}
							onValueChange={(v) => setDistrictId(v === 'all' ? undefined : Number(v))}
						>
							<SelectTrigger>
								<SelectValue placeholder={t('fields.district')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{tCommon('all')}</SelectItem>
								{districts.map((d) => (
									<SelectItem key={d.id} value={String(d.id)}>
										{d[localeKey]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>

			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<Label className="text-xs">{t('filters.priceFrom')}</Label>
					<Input
						type="number"
						inputMode="numeric"
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value)}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">{t('filters.priceTo')}</Label>
					<Input
						type="number"
						inputMode="numeric"
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<Label className="text-xs">{t('filters.ageFrom')}</Label>
					<Input
						type="number"
						inputMode="numeric"
						min={0}
						value={ageMin}
						onChange={(e) => setAgeMin(e.target.value)}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">{t('filters.ageTo')}</Label>
					<Input
						type="number"
						inputMode="numeric"
						min={0}
						value={ageMax}
						onChange={(e) => setAgeMax(e.target.value)}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>{t('filters.dealType')}</Label>
					<Select
						value={dealType ?? 'all'}
						onValueChange={(v) => setDealType(v === 'all' ? undefined : (v as never))}
					>
						<SelectTrigger>
							<SelectValue placeholder={tCommon('all')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{tCommon('all')}</SelectItem>
							<SelectItem value="sale">{t('dealTypes.sale')}</SelectItem>
							<SelectItem value="gift">{t('dealTypes.gift')}</SelectItem>
							<SelectItem value="exchange">{t('dealTypes.exchange')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>{t('sort.label')}</Label>
					<Select value={sort} onValueChange={(v) => setSort(v as Filters['sort'])}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">{t('sort.newest')}</SelectItem>
							<SelectItem value="priceAsc">{t('sort.priceAsc')}</SelectItem>
							<SelectItem value="priceDesc">{t('sort.priceDesc')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-2 pt-2">
					<Button onClick={apply} className="flex-1" disabled={isPending}>
						{t('filters.apply')}
					</Button>
					<Button onClick={reset} variant="outline" disabled={isPending}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
