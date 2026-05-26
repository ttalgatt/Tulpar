import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth';
import { fetchCategories, fetchRegions } from '@/lib/listings/queries';
import { ListingWizard } from '@/components/listings/listing-wizard';

export default async function CreateListingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const user = await getCurrentUser();
	if (!user) redirect({ href: '/auth/login', locale });

	const t = await getTranslations('listings');
	const [categories, regions] = await Promise.all([fetchCategories(), fetchRegions()]);

	return (
		<div className="container max-w-3xl py-8">
			<h1 className="mb-6 text-2xl font-bold">{t('createTitle')}</h1>
			<ListingWizard
				mode="create"
				userId={user!.id}
				categories={categories}
				regions={regions}
				locale={locale}
			/>
		</div>
	);
}
