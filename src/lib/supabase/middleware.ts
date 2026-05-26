import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

type CookieEntry = { name: string; value: string; options?: CookieOptions };

export async function updateSession(request: NextRequest, response: NextResponse) {
	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet: CookieEntry[]) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
					cookiesToSet.forEach(({ name, value, options }) => {
						response.cookies.set(name, value, options);
					});
				},
			},
		},
	);

	// Обязательный вызов: обновляет access/refresh токены в куках.
	await supabase.auth.getUser();

	return response;
}
