'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ViewTracker({ listingId }: { listingId: string }) {
	useEffect(() => {
		const key = `viewed:${listingId}`;
		if (typeof window === 'undefined') return;
		if (sessionStorage.getItem(key)) return;
		sessionStorage.setItem(key, '1');
		const supabase = createClient();
		supabase.rpc('increment_listing_views', { p_listing_id: listingId }).then(() => undefined);
	}, [listingId]);

	return null;
}
