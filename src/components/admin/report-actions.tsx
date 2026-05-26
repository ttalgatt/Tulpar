'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { resolveReportAction } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';

export function ReportActions({ reportId }: { reportId: string }) {
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	function handle(action: 'resolved' | 'rejected') {
		startTransition(async () => {
			const res = await resolveReportAction(reportId, action);
			if (res.ok) {
				toast({ title: action });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<div className="flex gap-2 pt-2">
			<Button size="sm" onClick={() => handle('resolved')} disabled={isPending}>
				Принять
			</Button>
			<Button size="sm" variant="outline" onClick={() => handle('rejected')} disabled={isPending}>
				Отклонить
			</Button>
		</div>
	);
}
