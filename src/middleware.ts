import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
	const response = intlMiddleware(request) ?? NextResponse.next();
	return updateSession(request, response);
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/health|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)',
	],
};
