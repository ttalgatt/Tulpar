import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from './reset-password-form';

export default async function ResetPasswordPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('auth');

	return (
		<div className="container flex justify-center py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{t('resetPasswordTitle')}</CardTitle>
					<CardDescription>{t('resetPasswordSubtitle')}</CardDescription>
				</CardHeader>
				<CardContent>
					<ResetPasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}
