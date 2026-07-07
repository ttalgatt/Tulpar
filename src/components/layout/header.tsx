import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { getCurrentUser, isModerator } from '@/lib/auth';
import { Plus } from 'lucide-react';

export async function Header() {
	const t = await getTranslations('nav');
	const tCommon = await getTranslations('common');
	const user = await getCurrentUser();

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center gap-4">
			<Link href="/" className="flex items-center gap-2">
				<Image
					src="/logo.png"
					alt="Бұзау"
					width={36}
					height={36}
					priority
					className="h-9 w-9"
				/>
				<div className="flex flex-col leading-tight">
					<span className="text-lg font-bold">Бұзау</span>
					<span className="hidden text-[11px] text-muted-foreground sm:block">
						{tCommon('tagline')}
					</span>
				</div>
			</Link>

				<nav className="ml-6 hidden items-center gap-1 text-sm font-medium md:flex">
					<Link
						href="/listings"
						className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
					>
						{t('listings')}
					</Link>
					<Link
						href={{ pathname: '/listings', query: { kind: 'goods' } }}
						className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
					>
						{t('goods')}
					</Link>
					<Link
						href={{ pathname: '/listings', query: { kind: 'services' } }}
						className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
					>
						{t('services')}
					</Link>
					<Link
						href="/events"
						className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
					>
						{t('events')}
					</Link>
				</nav>

			<div className="ml-auto flex items-center gap-2">
				<LocaleSwitcher />
				<Button asChild size="sm">
					<Link href={user ? '/listings/new' : '/auth/register'}>
						<Plus className="mr-1 h-4 w-4" />
						{t('createListing')}
					</Link>
				</Button>
				{user ? (
					<UserMenu
						email={user.email ?? ''}
						userId={user.id}
						isModerator={isModerator(user)}
					/>
				) : (
					<Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
						<Link href="/auth/login">{t('signIn')}</Link>
					</Button>
				)}
			</div>
			</div>
		</header>
	);
}
