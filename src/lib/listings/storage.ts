const PHOTOS_BUCKET = 'listing-photos';

export function photoPublicUrl(path: string) {
	const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!base) return path;
	return `${base}/storage/v1/object/public/${PHOTOS_BUCKET}/${path}`;
}

export function eventCoverUrl(path: string | null) {
	if (!path) return null;
	const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!base) return path;
	return `${base}/storage/v1/object/public/event-covers/${path}`;
}

export function avatarUrl(path: string | null) {
	if (!path) return null;
	if (path.startsWith('http')) return path;
	const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!base) return path;
	return `${base}/storage/v1/object/public/avatars/${path}`;
}

export { PHOTOS_BUCKET };
