import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function Footer() {
	const t = await getTranslations('footer');
	const tCommon = await getTranslations('common');
	const year = new Date().getFullYear();

	return (
		<footer className="border-t bg-muted/30 mt-12">
			<div className="container py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
				<div>
					<div className="flex items-center gap-2 font-heading font-bold text-lg mb-2">
				<Image src="/logo.png" alt="Бұзау" width={28} height={28} className="h-7 w-7" />
					<span>Бұзау</span>
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
