'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { signInAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function formAction(_prev: unknown, formData: FormData) {
	const res = await signInAction(formData);
	return res.ok ? null : res.error;
}

function SubmitButton({ label }: { label: string }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? '…' : label}
		</Button>
	);
}

export function SignInForm() {
	const t = useTranslations('auth');
	const [state, action] = useFormState(formAction, null);

	return (
		<form action={action} className="space-y-4">
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
			{state && <p className="text-sm text-destructive">{state}</p>}
			<SubmitButton label={t('signIn')} />
		</form>
	);
}
