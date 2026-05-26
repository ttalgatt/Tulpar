import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUpForm } from './sign-up-form';

export default async function RegisterPage({
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
					<CardTitle>{t('signUpTitle')}</CardTitle>
					<CardDescription>{t('signUpSubtitle')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SignUpForm />
					<div className="text-sm text-muted-foreground">
						{t('haveAccount')}{' '}
						<Link href="/auth/login" className="text-primary hover:underline">
							{t('signIn')}
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
