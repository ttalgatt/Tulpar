-- =============================================================================
-- 20260101000200_events.sql
-- События (выставки, соревнования и т.п.)
-- =============================================================================

create type public.event_status as enum ('draft', 'published', 'archived');

create table public.events (
	id uuid primary key default gen_random_uuid(),
	title_ru text not null,
	title_kk text,
	description_ru text,
	description_kk text,
	starts_at timestamptz not null,
	ends_at timestamptz,
	city_id integer references public.cities(id) on delete set null,
	address text,
	organizer text,
	cover_path text,
	status public.event_status not null default 'draft',
	created_by uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events(starts_at);
create index events_status_idx on public.events(status);
create index events_city_idx on public.events(city_id);

alter table public.events enable row level security;

create policy "events_select_published"
	on public.events for select
	using (status = 'published' or created_by = auth.uid());
