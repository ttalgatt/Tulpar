'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { createListingAction, updateListingAction } from '@/lib/listings/actions';
import { CATEGORY_KIND_ORDER } from '@/lib/listings/categories';
import { photoPublicUrl } from '@/lib/listings/storage';
import { cn, formatAge } from '@/lib/utils';
import type { ListingInput } from '@/lib/listings/schemas';
import { Loader2, Upload, X, GripVertical } from 'lucide-react';

interface Category {
	id: number;
	parent_id: number | null;
	slug: string;
	kind: 'pets' | 'livestock' | 'goods' | 'services' | 'events';
	name_ru: string;
	name_kk: string;
}

interface Region {
	id: number;
	slug: string;
	name_ru: string;
	name_kk: string;
}

interface CityRow {
	id: number;
	region_id: number;
	slug: string;
	name_ru: string;
	name_kk: string;
}

interface DistrictRow {
	id: number;
	city_id: number;
	slug: string;
	name_ru: string;
	name_kk: string;
}

interface Photo {
	path: string;
	url: string;
	orderIndex: number;
}

interface Props {
	mode: 'create' | 'edit';
	listingId?: string;
	userId: string;
	categories: Category[];
	regions: Region[];
	locale: string;
	initial?: Partial<ListingInput> & { photos?: Photo[] };
}

const STEPS = ['category', 'details', 'location', 'photos', 'review'] as const;

export function ListingWizard({
	mode,
	listingId,
	userId,
	categories,
	regions,
	locale,
	initial,
}: Props) {
	const t = useTranslations('listings');
	const tCommon = useTranslations('common');
	const router = useRouter();
	const { toast } = useToast();
	const [step, setStep] = useState(0);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
	const [title, setTitle] = useState(initial?.title ?? '');
	const [description, setDescription] = useState(initial?.description ?? '');
	const [price, setPrice] = useState<string>(initial?.price ? String(initial.price) : '');
	const [dealType, setDealType] = useState<'sale' | 'gift' | 'exchange'>(
		initial?.dealType ?? 'sale',
	);
	const [quantity, setQuantity] = useState<string>(
		initial?.quantity ? String(initial.quantity) : '',
	);
	const [unit, setUnit] = useState<'piece' | 'head' | 'kg' | ''>(initial?.unit ?? '');
	const [isBulk, setIsBulk] = useState<boolean>(initial?.isBulk ?? false);
	const [ageValue, setAgeValue] = useState<string>(() => {
		if (!initial?.ageMonths) return '';
		const m = initial.ageMonths;
		return m % 12 === 0 ? String(m / 12) : String(m);
	});
	const [ageUnit, setAgeUnit] = useState<'months' | 'years'>(() => {
		if (!initial?.ageMonths) return 'months';
		return initial.ageMonths % 12 === 0 ? 'years' : 'months';
	});
	const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');

	function formatPhone(raw: string): string {
		// Strip everything except digits and leading +
		const digits = raw.replace(/\D/g, '');
		if (!digits) return '';
		// Kazakhstan/Russia: +7 (XXX) XXX-XX-XX
		const d = digits.startsWith('7') ? digits : digits.startsWith('8') ? '7' + digits.slice(1) : digits;
		let out = '+7';
		if (d.length > 1) out += ' (' + d.slice(1, 4);
		if (d.length >= 4) out += ') ' + d.slice(4, 7);
		if (d.length >= 7) out += '-' + d.slice(7, 9);
		if (d.length >= 9) out += '-' + d.slice(9, 11);
		return out;
	}
	const [regionId, setRegionId] = useState<number | null>(initial?.regionId ?? null);
	const [cityId, setCityId] = useState<number | null>(initial?.cityId ?? null);
	const [districtId, setDistrictId] = useState<number | null>(initial?.districtId ?? null);
	const [cities, setCities] = useState<CityRow[]>([]);
	const [districts, setDistricts] = useState<DistrictRow[]>([]);
	const [photos, setPhotos] = useState<Photo[]>(initial?.photos ?? []);
	const [uploading, setUploading] = useState(false);

	const selectedCategory = useMemo(
		() => categories.find((c) => c.id === categoryId) ?? null,
		[categories, categoryId],
	);

	const requiresQuantity =
		selectedCategory?.kind === 'livestock' || selectedCategory?.kind === 'goods';
	const isService = selectedCategory?.kind === 'services';

	async function loadCities(rId: number, keepSelection = false) {
		const supabase = createClient();
		const { data } = await supabase
			.from('cities')
			.select('*')
			.eq('region_id', rId)
			.order('name_ru');
		setCities(data ?? []);
		if (!keepSelection) {
			setDistricts([]);
			setCityId(null);
			setDistrictId(null);
		}
	}

	async function loadDistricts(cId: number, keepSelection = false) {
		const supabase = createClient();
		const { data } = await supabase
			.from('districts')
			.select('*')
			.eq('city_id', cId)
			.order('name_ru');
		setDistricts(data ?? []);
		if (!keepSelection) {
			setDistrictId(null);
		}
	}

	useEffect(() => {
		if (initial?.regionId) {
			void loadCities(initial.regionId, true).then(() => {
				if (initial.cityId) void loadDistricts(initial.cityId, true);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount for edit mode
	}, []);

	async function handleUpload(files: FileList | null) {
		if (!files || files.length === 0) return;
		setUploading(true);
		const supabase = createClient();
		const next: Photo[] = [...photos];
		for (const file of Array.from(files).slice(0, 20 - photos.length)) {
			const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
			const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
			const { error: upErr } = await supabase.storage
				.from('listing-photos')
				.upload(path, file, { contentType: file.type, upsert: false });
			if (upErr) {
				toast({ variant: 'destructive', title: 'Upload error', description: upErr.message });
				continue;
			}
			next.push({ path, url: photoPublicUrl(path), orderIndex: next.length });
		}
		setPhotos(next);
		setUploading(false);
	}

	async function removePhoto(path: string) {
		const supabase = createClient();
		await supabase.storage.from('listing-photos').remove([path]);
		setPhotos((prev) => prev.filter((p) => p.path !== path).map((p, i) => ({ ...p, orderIndex: i })));
	}

	function buildInput(): ListingInput {
		let ageMonths: number | null = null;
		if (ageValue) {
			const v = Number(ageValue);
			ageMonths = ageUnit === 'years' ? Math.round(v * 12) : Math.round(v);
		}
		return {
			categoryId: categoryId!,
			regionId,
			cityId,
			districtId,
			title,
			description,
			price: price ? Number(price) : null,
			currency: 'KZT',
			dealType,
			quantity: quantity ? Number(quantity) : null,
			unit: unit || null,
			isBulk,
			ageMonths,
			photos: photos.map((p, i) => ({ path: p.path, orderIndex: i })),
			contactPhone,
		};
	}

	function canGoNext(): boolean {
		if (STEPS[step] === 'category') return !!categoryId;
		if (STEPS[step] === 'details') return !!title.trim();
		return true;
	}

	function submit(publish: boolean) {
		setError(null);
		if (!categoryId) {
			setError(t('steps.category'));
			return;
		}
		startTransition(async () => {
			const input = buildInput();
			const res =
				mode === 'create'
					? await createListingAction(input, { publish })
					: await updateListingAction(listingId!, input, { publish });

			if (!res.ok) {
				setError(res.error);
				return;
			}
			toast({
				title: publish ? t('messages.submittedForReview') : t('messages.created'),
			});
			router.push(`/listings/${res.data.id}`);
			router.refresh();
		});
	}

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';

	const kindLabels: Record<string, { ru: string; kk: string }> = {
		pets: { ru: 'Домашние животные', kk: 'Үй жануарлары' },
		livestock: { ru: 'Домашний скот', kk: 'Мал' },
		goods: { ru: 'Товары', kk: 'Тауарлар' },
		services: { ru: 'Услуги', kk: 'Қызметтер' },
	};
	const groupedCategories = CATEGORY_KIND_ORDER.map((kind) => ({
		kind,
		label: locale === 'kk' ? kindLabels[kind].kk : kindLabels[kind].ru,
		items: categories.filter((c) => c.kind === kind),
	})).filter((group) => group.items.length > 0);

	return (
		<div className="space-y-6">
			<Steps current={step} />

			<Card>
				<CardContent className="p-6">
					{STEPS[step] === 'category' && (
						<div className="space-y-6">
							<Label>{t('fields.category')}</Label>
							{groupedCategories.map((group) => (
								<div key={group.kind} className="space-y-2">
									<h3 className="text-sm font-semibold text-muted-foreground">
										{group.label}
									</h3>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
										{group.items.map((c) => (
											<button
												key={c.id}
												type="button"
												onClick={() => setCategoryId(c.id)}
												className={cn(
													'rounded-md border px-3 py-3 text-left text-sm transition hover:border-primary hover:bg-accent/50',
													categoryId === c.id && 'border-primary bg-primary/10 font-medium',
												)}
											>
												{c[localeKey]}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					{STEPS[step] === 'details' && (
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="title">{t('fields.title')}</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									maxLength={200}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">{t('fields.description')}</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={6}
									maxLength={5000}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								{!isService && (
									<div className="space-y-2">
										<Label>{t('fields.dealType')}</Label>
										<Select
											value={dealType}
											onValueChange={(v) => setDealType(v as typeof dealType)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="sale">{t('dealTypes.sale')}</SelectItem>
												<SelectItem value="gift">{t('dealTypes.gift')}</SelectItem>
												<SelectItem value="exchange">{t('dealTypes.exchange')}</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}

								{(isService || dealType !== 'gift') && (
									<div className="space-y-2">
										<Label htmlFor="price">{t('fields.price')} (KZT)</Label>
										<Input
											id="price"
											type="number"
											inputMode="numeric"
											value={price}
											onChange={(e) => setPrice(e.target.value)}
										/>
									</div>
								)}

								{requiresQuantity && (
									<>
										<div className="space-y-2">
											<Label htmlFor="qty">{t('fields.quantity')}</Label>
											<Input
												id="qty"
												type="number"
												min={1}
												value={quantity}
												onChange={(e) => setQuantity(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label>{t('fields.unit')}</Label>
											<Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="piece">{t('units.piece')}</SelectItem>
													<SelectItem value="head">{t('units.head')}</SelectItem>
													<SelectItem value="kg">{t('units.kg')}</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</>
								)}

								{selectedCategory?.kind === 'livestock' && (
									<label className="flex items-center gap-2 sm:col-span-2">
										<input
											type="checkbox"
											checked={isBulk}
											onChange={(e) => setIsBulk(e.target.checked)}
											className="h-4 w-4 rounded border-input"
										/>
										<span className="text-sm">{t('fields.isBulk')}</span>
									</label>
								)}
							</div>

							{(selectedCategory?.kind === 'pets' || selectedCategory?.kind === 'livestock') && (
								<div className="space-y-2">
									<Label>{t('fields.age')}</Label>
									<div className="flex gap-2">
										<Input
											type="number"
											inputMode="numeric"
											min={0}
											value={ageValue}
											onChange={(e) => setAgeValue(e.target.value)}
											className="w-28"
											placeholder="—"
										/>
										<Select
											value={ageUnit}
											onValueChange={(v) => setAgeUnit(v as 'months' | 'years')}
										>
											<SelectTrigger className="w-32">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="months">{t('fields.ageMonths')}</SelectItem>
												<SelectItem value="years">{t('fields.ageYears')}</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="contactPhone">{t('fields.contactPhone')}</Label>
								<Input
									id="contactPhone"
									name="contactPhone"
									type="tel"
									value={contactPhone}
									onChange={(e) => setContactPhone(formatPhone(e.target.value))}
									placeholder="+7 (___) ___-__-__"
									maxLength={18}
								/>
								<p className="text-xs text-muted-foreground">{t('fields.contactPhoneHint')}</p>
							</div>
						</div>
					)}

					{STEPS[step] === 'location' && (
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label>{t('fields.region')}</Label>
								<Select
									value={regionId ? String(regionId) : ''}
									onValueChange={(v) => {
										const id = Number(v);
										setRegionId(id);
										loadCities(id);
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="—" />
									</SelectTrigger>
									<SelectContent>
										{regions.map((r) => (
											<SelectItem key={r.id} value={String(r.id)}>
												{r[localeKey]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>{t('fields.city')}</Label>
								<SearchableSelect
									value={cityId ? String(cityId) : undefined}
									onValueChange={(v) => {
										if (!v) {
											setCityId(null);
											setDistricts([]);
											setDistrictId(null);
											return;
										}
										const id = Number(v);
										setCityId(id);
										loadDistricts(id);
									}}
									disabled={!regionId}
									options={cities.map((c) => ({
										value: String(c.id),
										label: c[localeKey],
									}))}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t('fields.district')}</Label>
								<Select
									value={districtId ? String(districtId) : ''}
									onValueChange={(v) => setDistrictId(Number(v))}
									disabled={!cityId || districts.length === 0}
								>
									<SelectTrigger>
										<SelectValue placeholder="—" />
									</SelectTrigger>
									<SelectContent>
										{districts.map((d) => (
											<SelectItem key={d.id} value={String(d.id)}>
												{d[localeKey]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{STEPS[step] === 'photos' && (
						<div className="space-y-4">
							<Label>{t('fields.photos')}</Label>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
								{photos.map((p) => (
									<div key={p.path} className="relative aspect-square rounded-md border bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={p.url}
											alt=""
											className="h-full w-full rounded-md object-cover"
										/>
										<button
											type="button"
											onClick={() => removePhoto(p.path)}
											className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow"
											aria-label="Remove"
										>
											<X className="h-4 w-4" />
										</button>
										<div className="absolute left-1 top-1 rounded bg-background/80 p-1">
											<GripVertical className="h-3 w-3" />
										</div>
									</div>
								))}
								{photos.length < 20 && (
									<label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-muted-foreground hover:bg-accent/50">
										{uploading ? (
											<Loader2 className="h-6 w-6 animate-spin" />
										) : (
											<>
												<Upload className="h-6 w-6" />
												<span className="text-xs">JPG / PNG / WebP</span>
											</>
										)}
										<input
											type="file"
											multiple
											accept="image/jpeg,image/png,image/webp"
											className="hidden"
											onChange={(e) => handleUpload(e.target.files)}
											disabled={uploading}
										/>
									</label>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Максимум 20 фото · до 5 МБ каждая · первое фото будет обложкой
							</p>
						</div>
					)}

					{STEPS[step] === 'review' && (
						<div className="space-y-3 text-sm">
							<Row label={t('fields.category')}>
								{selectedCategory ? selectedCategory[localeKey] : '—'}
							</Row>
						<Row label={t('fields.title')}>{title || '—'}</Row>
						{!isService && (
							<Row label={t('fields.dealType')}>{t(`dealTypes.${dealType}`)}</Row>
						)}
						{price && <Row label={t('fields.price')}>{price} KZT</Row>}
						{quantity && (
							<Row label={t('fields.quantity')}>
								{quantity} {unit ? t(`units.${unit}`) : ''}
							</Row>
						)}
						{ageValue && (
							<Row label={t('fields.age')}>
								{formatAge(
									ageUnit === 'years' ? Math.round(Number(ageValue) * 12) : Math.round(Number(ageValue)),
									locale,
								)}
							</Row>
						)}
						<Row label={t('fields.region')}>
								{regions.find((r) => r.id === regionId)?.[localeKey] ?? '—'}
							</Row>
							<Row label={t('fields.city')}>
								{cities.find((c) => c.id === cityId)?.[localeKey] ?? '—'}
							</Row>
							<Row label={t('fields.photos')}>{photos.length}</Row>
						</div>
					)}

					{error && <p className="mt-4 text-sm text-destructive">{error}</p>}
				</CardContent>
			</Card>

		{step < STEPS.length - 1 ? (
			<div className="flex justify-between gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={step === 0 || isPending}
					onClick={() => setStep((s) => Math.max(0, s - 1))}
				>
					{tCommon('back')}
				</Button>
				<Button
					type="button"
					onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
					disabled={!canGoNext() || isPending}
				>
					{tCommon('next')}
				</Button>
			</div>
		) : (
			<div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
				<Button
					type="button"
					variant="outline"
					disabled={isPending}
					onClick={() => setStep((s) => Math.max(0, s - 1))}
				>
					{tCommon('back')}
				</Button>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Button variant="outline" onClick={() => submit(false)} disabled={isPending}>
						{t('actions.saveAsDraft')}
					</Button>
					<Button onClick={() => submit(true)} disabled={isPending}>
						{isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
						{t('actions.submitForReview')}
					</Button>
				</div>
			</div>
		)}
		</div>
	);
}

function Steps({ current }: { current: number }) {
	const t = useTranslations('listings.steps');
	const labels = STEPS.map((k) => t(k));
	return (
		<ol className="flex flex-wrap gap-2 text-sm">
			{labels.map((label, i) => (
				<li
					key={label}
					className={cn(
						'rounded-md border px-3 py-1.5',
						i === current
							? 'border-primary bg-primary/10 font-semibold text-primary'
							: i < current
								? 'border-primary/30 text-muted-foreground'
								: 'text-muted-foreground',
					)}
				>
					{i + 1}. {label}
				</li>
			))}
		</ol>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex justify-between gap-4 border-b py-2 last:border-0">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-right font-medium">{children}</span>
		</div>
	);
}
