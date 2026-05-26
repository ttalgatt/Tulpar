'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { toggleFavoriteAction } from '@/lib/listings/favorite-actions';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
	listingId: string;
	initial: boolean;
	authenticated: boolean;
}

export function FavoriteButton({ listingId, initial, authenticated }: Props) {
	const t = useTranslations('listings.detail');
	const router = useRouter();
	const [active, setActive] = useState(initial);
	const [isPending, startTransition] = useTransition();

	if (!authenticated) {
		return (
			<Button asChild variant="outline">
				<Link href="/auth/login">
					<Heart className="mr-2 h-4 w-4" />
					{t('addFavorite')}
				</Link>
			</Button>
		);
	}

	function toggle() {
		startTransition(async () => {
			const res = await toggleFavoriteAction(listingId);
			if (res.ok) {
				setActive(res.data);
				router.refresh();
			}
		});
	}

	return (
		<Button variant="outline" onClick={toggle} disabled={isPending}>
			<Heart className={cn('mr-2 h-4 w-4', active && 'fill-current text-destructive')} />
			{active ? t('removeFavorite') : t('addFavorite')}
		</Button>
	);
}
