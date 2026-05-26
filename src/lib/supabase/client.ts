import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Database — заглушка. Сгенерируйте актуальные типы через `pnpm db:types`.
export function createClient() {
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
