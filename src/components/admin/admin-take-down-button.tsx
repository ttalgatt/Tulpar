'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminArchiveListingAction } from '@/lib/admin/actions';
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
	listingId: string;
	/** Компактный вид для карточки в сетке */
	compact?: boolean;
	className?: string;
}

export function AdminTakeDownButton({ listingId, compact = false, className }: Props) {
	const t = useTranslations('admin');
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	function handleClick(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!confirm(t('takeDownConfirm'))) return;
		startTransition(async () => {
			const res = await adminArchiveListingAction(listingId);
			if (res.ok) {
				toast({ title: t('takenDown') });
				router.refresh();
			} else {
				toast({ variant: 'destructive', title: res.error });
			}
		});
	}

	return (
		<Button
			type="button"
			variant="destructive"
			size={compact ? 'sm' : 'default'}
			className={cn(compact && 'h-8 px-2 text-xs', className)}
			onClick={handleClick}
			disabled={isPending}
		>
			<Archive className={cn('h-4 w-4', !compact && 'mr-2')} />
			{!compact && t('takeDown')}
			{compact && <span className="ml-1">{t('takeDown')}</span>}
		</Button>
	);
}
