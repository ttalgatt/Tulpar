import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './profile-form';

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!user) redirect({ href: '/auth/login', locale });

	const t = await getTranslations('profile');

	return (
		<div className="container max-w-2xl py-10">
			<Card>
				<CardHeader>
					<CardTitle>{t('title')}</CardTitle>
				</CardHeader>
				<CardContent>
					<ProfileForm
						initial={{
							email: user!.email ?? '',
							fullName: user!.fullName ?? '',
							phone: user!.phone ?? '',
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
