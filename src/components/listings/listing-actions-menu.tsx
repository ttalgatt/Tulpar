'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { archiveListingAction, deleteListingAction } from '@/lib/listings/actions';
import { MoreVertical, Edit, Archive, Trash2 } from 'lucide-react';

interface Props {
	listingId: string;
	status: string;
}

export function ListingActionsMenu({ listingId, status }: Props) {
	const t = useTranslations('listings');
	const tCommon = useTranslations('common');
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	function archive() {
		startTransition(async () => {
			const res = await archiveListingAction(listingId);
			if (res.ok) {
				toast({ title: t('actions.archive') });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	function remove() {
		if (!confirm(tCommon('delete') + '?')) return;
		startTransition(async () => {
			const res = await deleteListingAction(listingId);
			if (res.ok) {
				toast({ title: t('messages.deleted') });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" disabled={isPending}>
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link href={`/listings/${listingId}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						{tCommon('edit')}
					</Link>
				</DropdownMenuItem>
				{status !== 'archived' && (
					<DropdownMenuItem onClick={archive}>
						<Archive className="mr-2 h-4 w-4" />
						{t('actions.archive')}
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={remove} className="text-destructive">
					<Trash2 className="mr-2 h-4 w-4" />
					{tCommon('delete')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
