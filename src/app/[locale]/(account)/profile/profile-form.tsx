'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updateProfileAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Props {
	initial: { email: string; fullName: string; phone: string };
}

export function ProfileForm({ initial }: Props) {
	const t = useTranslations('profile');
	const tCommon = useTranslations('common');
	const { toast } = useToast();
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			const res = await updateProfileAction(formData);
			if (res.ok) toast({ title: t('updated') });
			else setError(res.error);
		});
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">{t('email')}</Label>
				<Input id="email" value={initial.email} disabled />
			</div>
			<div className="space-y-2">
				<Label htmlFor="fullName">{t('fullName')}</Label>
				<Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
			</div>
			<div className="space-y-2">
				<Label htmlFor="phone">{t('phone')}</Label>
				<Input
					id="phone"
					name="phone"
					type="tel"
					defaultValue={initial.phone}
					placeholder="+7 (___) ___-__-__"
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" disabled={isPending}>
				{isPending ? '…' : tCommon('save')}
			</Button>
		</form>
	);
}
