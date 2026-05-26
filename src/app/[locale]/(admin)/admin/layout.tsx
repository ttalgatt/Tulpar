import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect, Link } from '@/i18n/routing';
import { getCurrentUser, isModerator, isAdmin } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, ShieldAlert, Users, FolderTree, MapPin, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

export default async function AdminLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!user) redirect({ href: '/auth/login', locale });
	if (!isModerator(user)) {
		const t = await getTranslations('admin');
		return (
			<div className="container py-16">
				<Card>
					<CardContent className="py-12 text-center">
						<ShieldAlert className="mx-auto mb-2 h-10 w-10 text-destructive" />
						<p className="text-lg font-semibold">{t('forbidden')}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const t = await getTranslations('admin');
	const isFullAdmin = isAdmin(user);

	return (
		<div className="container py-6">
			<h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
			<div className="grid gap-6 lg:grid-cols-[220px,1fr]">
				<aside>
					<nav className="space-y-1 text-sm">
						<NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
							Dashboard
						</NavLink>
						<NavLink href="/admin/moderation" icon={<ShieldAlert className="h-4 w-4" />}>
							{t('moderation')}
						</NavLink>
						<NavLink href="/admin/reports" icon={<ShieldAlert className="h-4 w-4" />}>
							{t('reports')}
						</NavLink>
						<NavLink href="/admin/events" icon={<Calendar className="h-4 w-4" />}>
							{t('events')}
						</NavLink>
						{isFullAdmin && (
							<>
								<NavLink href="/admin/users" icon={<Users className="h-4 w-4" />}>
									{t('users')}
								</NavLink>
								<NavLink href="/admin/categories" icon={<FolderTree className="h-4 w-4" />}>
									{t('categories')}
								</NavLink>
								<NavLink href="/admin/locations" icon={<MapPin className="h-4 w-4" />}>
									{t('locations')}
								</NavLink>
							</>
						)}
					</nav>
				</aside>
				<div>{children}</div>
			</div>
		</div>
	);
}

function NavLink({
	href,
	icon,
	children,
}: {
	href: string;
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<Link
			href={href as never}
			className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
		>
			{icon}
			{children}
		</Link>
	);
}
