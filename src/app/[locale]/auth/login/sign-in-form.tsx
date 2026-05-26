'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { signInAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
	const t = useTranslations('auth');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			const res = await signInAction(formData);
			if (!res.ok) setError(res.error);
		});
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">{t('email')}</Label>
				<Input id="email" name="email" type="email" required autoComplete="email" />
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">{t('password')}</Label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					autoComplete="current-password"
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? '…' : t('signIn')}
			</Button>
		</form>
	);
}
