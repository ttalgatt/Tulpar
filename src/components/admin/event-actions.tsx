'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { deleteEventAction } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

export function AdminEventActions({ eventId }: { eventId: string }) {
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	function remove() {
		if (!confirm('Удалить?')) return;
		startTransition(async () => {
			const res = await deleteEventAction(eventId);
			if (res.ok) {
				toast({ title: 'Удалено' });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<Button size="sm" variant="ghost" onClick={remove} disabled={isPending}>
			<Trash2 className="h-4 w-4" />
		</Button>
	);
}
