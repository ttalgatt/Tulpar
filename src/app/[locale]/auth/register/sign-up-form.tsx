'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { signUpAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignUpForm() {
	const t = useTranslations('auth');
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		const password = String(formData.get('password') ?? '');
		const confirm = String(formData.get('passwordConfirm') ?? '');
		if (password !== confirm) {
			setError(t('passwordsMismatch'));
			return;
		}
		startTransition(async () => {
			const res = await signUpAction(formData);
			if (res.ok) setSuccess(true);
			else setError(res.error);
		});
	}

	if (success) {
		return <p className="rounded-md border bg-muted p-4 text-sm">{t('checkEmail')}</p>;
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="fullName">{t('fullName')}</Label>
				<Input id="fullName" name="fullName" required autoComplete="name" />
			</div>
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
					autoComplete="new-password"
					minLength={8}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="passwordConfirm">{t('passwordConfirm')}</Label>
				<Input
					id="passwordConfirm"
					name="passwordConfirm"
					type="password"
					required
					autoComplete="new-password"
					minLength={8}
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? '…' : t('signUp')}
			</Button>
		</form>
	);
}
