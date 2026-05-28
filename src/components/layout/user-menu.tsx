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
}

export function UserMenu({ email, isModerator }: Props) {
	const t = useTranslations('nav');
	const [isPending, startTransition] = useTransition();

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
				<Button variant="ghost" size="icon" aria-label="User menu" disabled={isPending}>
					<User className="h-5 w-5" />
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
						<Link href="/admin">
							<Shield className="h-4 w-4 mr-2" />
							{t('admin')}
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
