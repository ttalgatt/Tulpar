'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createReportAction } from '@/lib/listings/report-actions';

const REASONS = ['spam', 'fraud', 'prohibited', 'wrong_category', 'duplicate', 'other'] as const;

function SubmitBtn({ label }: { label: string }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" size="sm" disabled={pending}>
			{pending ? '…' : label}
		</Button>
	);
}

interface Props {
	listingId: string;
}

export function ReportButton({ listingId }: Props) {
	const t = useTranslations('listings.detail');
	const [open, setOpen] = useState(false);
	const [state, action] = useFormState(createReportAction, null);

	if (state && 'ok' in state && state.ok) {
		return (
			<p className="text-sm text-muted-foreground">
				✓ {t('reportSent')}
			</p>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
					<Flag className="mr-1.5 h-3.5 w-3.5" />
					{t('report')}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t('reportTitle')}</DialogTitle>
				</DialogHeader>
				<form action={action} className="space-y-4">
					<input type="hidden" name="listingId" value={listingId} />

					<div className="space-y-2">
						<Label>{t('reportReason')}</Label>
						<div className="grid grid-cols-2 gap-2">
							{REASONS.map((r) => (
								<label key={r} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
									<input type="radio" name="reason" value={r} required className="accent-primary" />
									{t(`reportReasons.${r}`)}
								</label>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="report-comment">{t('reportComment')}</Label>
						<Textarea id="report-comment" name="comment" rows={3} maxLength={1000} />
					</div>

					{state && !state.ok && (
						<p className="text-sm text-destructive">{state.error}</p>
					)}

					<div className="flex justify-end gap-2">
						<Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
							Отмена
						</Button>
						<SubmitBtn label={t('reportSubmit')} />
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
