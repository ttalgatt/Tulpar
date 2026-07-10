'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
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
import { createEventAction } from '@/lib/admin/actions';
import { createClient } from '@/lib/supabase/client';
import { eventCoverUrl } from '@/lib/listings/storage';

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

export function EventForm({
	regions,
	cities,
	locale,
}: {
	regions: Region[];
	cities: City[];
	locale: string;
}) {
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();
	const [regionId, setRegionId] = useState<string>('');
	const [cityId, setCityId] = useState<string>('');
	const [coverPath, setCoverPath] = useState<string>('');
	const [coverPreview, setCoverPreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const filteredCities = regionId ? cities.filter((c) => c.region_id === Number(regionId)) : [];

	async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		const supabase = createClient();
		const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
		const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
		const { error } = await supabase.storage
			.from('event-covers')
			.upload(path, file, { contentType: file.type, upsert: false });
		if (error) {
			toast({ variant: 'destructive', title: 'Ошибка загрузки', description: error.message });
		} else {
			setCoverPath(path);
			setCoverPreview(eventCoverUrl(path));
		}
		setUploading(false);
	}

	function removeCover() {
		setCoverPath('');
		setCoverPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	}

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		startTransition(async () => {
			const res = await createEventAction({
				title: String(formData.get('title') ?? ''),
				description: String(formData.get('description') ?? ''),
				startsAt: String(formData.get('startsAt') ?? ''),
				endsAt: String(formData.get('endsAt') ?? ''),
				cityId: cityId ? Number(cityId) : null,
				address: String(formData.get('address') ?? ''),
				organizer: String(formData.get('organizer') ?? ''),
				coverPath,
				publish: formData.get('publish') === 'on',
			});
			if (res.ok) {
				toast({ title: 'Создано' });
				form.reset();
				setRegionId('');
				setCityId('');
				setCoverPath('');
				setCoverPreview(null);
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="title">Название *</Label>
					<Input id="title" name="title" required />
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="description">Описание</Label>
					<Textarea id="description" name="description" rows={3} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="startsAt">Начало *</Label>
					<Input id="startsAt" name="startsAt" type="datetime-local" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="endsAt">Окончание</Label>
					<Input id="endsAt" name="endsAt" type="datetime-local" />
				</div>
				<div className="space-y-2">
					<Label>Область</Label>
					<Select
						value={regionId}
						onValueChange={(v) => {
							setRegionId(v);
							setCityId('');
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
					<Label>Город</Label>
					<SearchableSelect
						value={cityId || undefined}
						onValueChange={(v) => setCityId(v ?? '')}
						disabled={!regionId}
						options={filteredCities.map((c) => ({
							value: String(c.id),
							label: c[localeKey],
						}))}
					/>
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="address">Адрес</Label>
					<Input id="address" name="address" />
				</div>
			<div className="space-y-2 sm:col-span-2">
				<Label htmlFor="organizer">Организатор</Label>
				<Input id="organizer" name="organizer" />
			</div>
			<div className="space-y-2 sm:col-span-2">
				<Label>Обложка события</Label>
				{coverPreview ? (
					<div className="relative w-48">
						<Image
							src={coverPreview}
							alt="Обложка"
							width={192}
							height={108}
							className="rounded-md object-cover"
						/>
						<button
							type="button"
							onClick={removeCover}
							className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
						>
							&#x2715;
						</button>
					</div>
				) : (
					<div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							onChange={handleCoverChange}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={uploading}
							onClick={() => fileInputRef.current?.click()}
						>
							{uploading ? 'Загрузка...' : 'Выбрать фото'}
						</Button>
					</div>
				)}
			</div>
		</div>
		<label className="flex items-center gap-2 text-sm">
				<input type="checkbox" name="publish" className="h-4 w-4 rounded border-input" />
				Опубликовать сразу
			</label>
			<Button type="submit" disabled={isPending}>
				Создать
			</Button>
		</form>
	);
}
