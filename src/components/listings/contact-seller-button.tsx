'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';

interface Props {
	ownerId: string;
	phone: string | null;
	isAuthenticated: boolean;
}

export function ContactSellerButton({ phone }: Props) {
	const t = useTranslations('listings.detail');
	const [revealed, setRevealed] = useState(false);

	if (!phone) {
		return (
			<Button variant="outline" disabled>
				<Phone className="mr-2 h-4 w-4" />
				—
			</Button>
		);
	}

	if (!revealed) {
		return (
			<Button onClick={() => setRevealed(true)}>
				<Phone className="mr-2 h-4 w-4" />
				{t('showPhone')}
			</Button>
		);
	}

	const tel = phone.replace(/[^0-9+]/g, '');
	const waNumber = tel.replace(/[^0-9]/g, '');
	const waText = encodeURIComponent(t('whatsappGreeting'));
	const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

	return (
		<>
			<Button asChild>
				<a href={`tel:${tel}`}>
					<Phone className="mr-2 h-4 w-4" />
					{phone}
				</a>
			</Button>
			<Button asChild variant="outline">
				<a href={waUrl} target="_blank" rel="noopener noreferrer">
					<MessageCircle className="mr-2 h-4 w-4" />
					WhatsApp
				</a>
			</Button>
		</>
	);
}
