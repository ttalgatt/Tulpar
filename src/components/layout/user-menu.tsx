'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Heart, Package, Shield } from 'lucide-react';

interface Props {
	email: string;
	userId: string;
	isModerator?: boolean;
	pendingModerationCount?: number;
}

function formatBadgeCount(count: number): string {
	return count > 99 ? '99+' : String(count);
}

export function UserMenu({ email, isModerator, pendingModerationCount = 0 }: Props) {
	const t = useTranslations('nav');
	const [isPending, startTransition] = useTransition();
	const showModerationBadge = Boolean(isModerator && pendingModerationCount > 0);
	const badgeLabel = formatBadgeCount(pendingModerationCount);

	function signOut() {
		startTransition(async () => {
			const supabase = createClient();
			await supabase.auth.signOut();
			// Hard navigation ensures server components (Header) are re-rendered
			// without relying on the RSC router cache, which may serve a stale
			// payload when soft-navigating right after signOut.
			window.location.href = '/';
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					aria-label={
						showModerationBadge
							? t('userMenuWithPending', { count: pendingModerationCount })
							: t('userMenu')
					}
					disabled={isPending}
				>
					<User className="h-5 w-5" />
					{showModerationBadge && (
						<span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
							{badgeLabel}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="truncate text-xs text-muted-foreground">
					{email}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile">
						<User className="h-4 w-4 mr-2" />
						{t('profile')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/my/listings">
						<Package className="h-4 w-4 mr-2" />
						{t('myListings')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/my/favorites">
						<Heart className="h-4 w-4 mr-2" />
						{t('favorites')}
					</Link>
				</DropdownMenuItem>
				{isModerator && (
					<DropdownMenuItem asChild>
						<Link
							href={showModerationBadge ? '/admin/moderation' : '/admin'}
							className="flex w-full items-center"
						>
							<Shield className="h-4 w-4 mr-2" />
							<span className="flex-1">{t('admin')}</span>
							{showModerationBadge && (
								<span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold leading-none text-destructive-foreground">
									{badgeLabel}
								</span>
							)}
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={signOut}>
					<LogOut className="h-4 w-4 mr-2" />
					{t('signOut')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
