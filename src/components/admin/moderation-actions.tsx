'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { approveListingAction, rejectListingAction } from '@/lib/admin/actions';
import { Check, X } from 'lucide-react';

export function ModerationActions({ listingId }: { listingId: string }) {
	const t = useTranslations('admin');
	const router = useRouter();
	const { toast } = useToast();
	const [reason, setReason] = useState('');
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	function approve() {
		startTransition(async () => {
			const res = await approveListingAction(listingId);
			if (res.ok) {
				toast({ title: t('approve') });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	function reject() {
		if (!reason.trim()) return;
		startTransition(async () => {
			const res = await rejectListingAction(listingId, reason);
			if (res.ok) {
				toast({ title: t('reject') });
				setOpen(false);
				setReason('');
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<div className="flex gap-2">
			<Button size="sm" onClick={approve} disabled={isPending}>
				<Check className="mr-1 h-4 w-4" />
				{t('approve')}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button size="sm" variant="destructive" disabled={isPending}>
						<X className="mr-1 h-4 w-4" />
						{t('reject')}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('rejectReason')}</DialogTitle>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="reason">{t('rejectReason')}</Label>
						<Textarea
							id="reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={4}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={reject} disabled={!reason.trim() || isPending}>
							{t('reject')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
