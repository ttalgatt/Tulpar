'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { resetPasswordAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
	const t = useTranslations('auth');
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			const res = await resetPasswordAction(formData);
			if (res.ok) setSent(true);
			else setError(res.error);
		});
	}

	if (sent) {
		return <p className="rounded-md border bg-muted p-4 text-sm">{t('resetLinkSent')}</p>;
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">{t('email')}</Label>
				<Input id="email" name="email" type="email" required autoComplete="email" />
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? '…' : t('sendResetLink')}
			</Button>
		</form>
	);
}
