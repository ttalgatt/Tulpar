import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
	const t = await getTranslations('errors');
	return (
		<div className="container flex flex-col items-center justify-center py-24 text-center">
			<h1 className="text-6xl font-bold">404</h1>
			<p className="mt-4 text-lg text-muted-foreground">{t('notFound')}</p>
			<Button asChild className="mt-6">
				<Link href="/">{t('goHome')}</Link>
			</Button>
		</div>
	);
}
