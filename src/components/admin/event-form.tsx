'use client';

import { useState, useTransition } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { createEventAction } from '@/lib/admin/actions';

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

	const localeKey = locale === 'kk' ? 'name_kk' : 'name_ru';
	const filteredCities = regionId ? cities.filter((c) => c.region_id === Number(regionId)) : [];

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		startTransition(async () => {
			const res = await createEventAction({
				titleRu: String(formData.get('titleRu') ?? ''),
				titleKk: String(formData.get('titleKk') ?? ''),
				descriptionRu: String(formData.get('descriptionRu') ?? ''),
				descriptionKk: String(formData.get('descriptionKk') ?? ''),
				startsAt: String(formData.get('startsAt') ?? ''),
				endsAt: String(formData.get('endsAt') ?? ''),
				cityId: cityId ? Number(cityId) : null,
				address: String(formData.get('address') ?? ''),
				organizer: String(formData.get('organizer') ?? ''),
				publish: formData.get('publish') === 'on',
			});
			if (res.ok) {
				toast({ title: 'Создано' });
				form.reset();
				setRegionId('');
				setCityId('');
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="titleRu">Название (RU) *</Label>
					<Input id="titleRu" name="titleRu" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="titleKk">Атауы (KK)</Label>
					<Input id="titleKk" name="titleKk" />
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="descriptionRu">Описание (RU)</Label>
					<Textarea id="descriptionRu" name="descriptionRu" rows={3} />
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="descriptionKk">Сипаттама (KK)</Label>
					<Textarea id="descriptionKk" name="descriptionKk" rows={3} />
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
					<Select value={regionId} onValueChange={setRegionId}>
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
					<Select value={cityId} onValueChange={setCityId} disabled={!regionId}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{filteredCities.map((c) => (
								<SelectItem key={c.id} value={String(c.id)}>
									{c[localeKey]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="address">Адрес</Label>
					<Input id="address" name="address" />
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="organizer">Организатор</Label>
					<Input id="organizer" name="organizer" />
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
