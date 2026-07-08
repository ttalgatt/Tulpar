'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const labels: Record<Locale, string> = {
	ru: 'Русский',
	kk: 'Қазақша',
};

export function LocaleSwitcher() {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const [isPending, startTransition] = useTransition();

	function change(next: Locale) {
		startTransition(() => {
			// useParams() includes `locale` which is not a route param — exclude it
			// so next-intl can correctly substitute [id] and other dynamic segments
			const { locale: _locale, ...routeParams } = params as Record<string, string>;
			router.replace(
				// @ts-expect-error — pathname typed as string, next-intl expects typed Href
				{ pathname, params: routeParams },
				{ locale: next },
			);
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" disabled={isPending}>
					<Globe className="h-4 w-4 mr-1" />
					{locale.toUpperCase()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{locales.map((l) => (
					<DropdownMenuItem
						key={l}
						onClick={() => change(l)}
						className={l === locale ? 'font-semibold' : ''}
					>
						{labels[l]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
