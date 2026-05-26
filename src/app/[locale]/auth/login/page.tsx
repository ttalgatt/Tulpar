import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInForm } from './sign-in-form';

export default async function LoginPage({
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
					<CardTitle>{t('signInTitle')}</CardTitle>
					<CardDescription>{t('signInSubtitle')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SignInForm />
					<div className="flex flex-col gap-2 text-sm text-muted-foreground">
						<Link
							href="/auth/reset-password"
							className="text-primary hover:underline self-start"
						>
							{t('forgotPassword')}
						</Link>
						<div>
							{t('noAccount')}{' '}
							<Link href="/auth/register" className="text-primary hover:underline">
								{t('signUp')}
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
