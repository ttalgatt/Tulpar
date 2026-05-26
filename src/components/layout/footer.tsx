import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PawPrint } from 'lucide-react';

export async function Footer() {
	const t = await getTranslations('footer');
	const tCommon = await getTranslations('common');
	const year = new Date().getFullYear();

	return (
		<footer className="border-t bg-muted/30 mt-12">
			<div className="container py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
				<div>
					<div className="flex items-center gap-2 font-bold text-lg mb-2">
						<PawPrint className="h-5 w-5 text-primary" />
						<span>Tulpar</span>
					</div>
					<p className="text-sm text-muted-foreground">{tCommon('tagline')}</p>
				</div>
				<div className="text-sm space-y-2">
					<div className="font-semibold mb-2">{t('about')}</div>
					<Link href="/about" className="block text-muted-foreground hover:text-foreground">
						{t('about')}
					</Link>
					<Link href="/contacts" className="block text-muted-foreground hover:text-foreground">
						{t('contacts')}
					</Link>
				</div>
				<div className="text-sm space-y-2">
					<div className="font-semibold mb-2">Legal</div>
					<Link href="/terms" className="block text-muted-foreground hover:text-foreground">
						{t('terms')}
					</Link>
					<Link href="/privacy" className="block text-muted-foreground hover:text-foreground">
						{t('privacy')}
					</Link>
				</div>
				<div className="text-sm text-muted-foreground">{t('copyright', { year })}</div>
			</div>
		</footer>
	);
}
