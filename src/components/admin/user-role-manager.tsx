'use client';

import { useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { grantRoleAction, revokeRoleAction } from '@/lib/admin/actions';
import { useToast } from '@/hooks/use-toast';

interface Props {
	userId: string;
	roles: string[];
}

const ALL_ROLES: Array<'moderator' | 'admin'> = ['moderator', 'admin'];

export function UserRoleManager({ userId, roles }: Props) {
	const router = useRouter();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	function toggle(role: 'moderator' | 'admin') {
		startTransition(async () => {
			const action = roles.includes(role) ? revokeRoleAction : grantRoleAction;
			const res = await action(userId, role);
			if (res.ok) {
				toast({ title: `${role} ${roles.includes(role) ? 'revoked' : 'granted'}` });
				router.refresh();
			} else toast({ variant: 'destructive', title: res.error });
		});
	}

	return (
		<div className="flex items-center gap-2">
			{roles.map((r) => (
				<Badge key={r} variant="secondary">
					{r}
				</Badge>
			))}
			{ALL_ROLES.map((role) => (
				<Button
					key={role}
					size="sm"
					variant={roles.includes(role) ? 'destructive' : 'outline'}
					onClick={() => toggle(role)}
					disabled={isPending}
				>
					{roles.includes(role) ? `- ${role}` : `+ ${role}`}
				</Button>
			))}
		</div>
	);
}
