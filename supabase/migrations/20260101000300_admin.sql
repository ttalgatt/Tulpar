-- =============================================================================
-- 20260101000300_admin.sql
-- Роли, жалобы, права модераторов в RLS.
-- =============================================================================

create type public.user_role as enum ('admin', 'moderator');

create table public.user_roles (
	user_id uuid not null references auth.users(id) on delete cascade,
	role public.user_role not null,
	granted_at timestamptz not null default now(),
	primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists(
		select 1 from public.user_roles
		where user_id = auth.uid() and role = 'admin'
	);
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists(
		select 1 from public.user_roles
		where user_id = auth.uid() and role in ('admin', 'moderator')
	);
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_moderator() to authenticated;

create policy "user_roles_select_self_or_admin"
	on public.user_roles for select
	using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_modify_admin"
	on public.user_roles for all
	using (public.is_admin())
	with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Расширяем RLS объявлений и событий — модераторы видят/правят всё
-- -----------------------------------------------------------------------------
create policy "listings_select_moderator"
	on public.listings for select
	using (public.is_moderator());

create policy "listings_update_moderator"
	on public.listings for update
	using (public.is_moderator())
	with check (public.is_moderator());

create policy "listings_delete_moderator"
	on public.listings for delete
	using (public.is_moderator());

create policy "events_modify_moderator"
	on public.events for all
	using (public.is_moderator())
	with check (public.is_moderator());

-- Категории и локации — управляет только админ
create policy "categories_modify_admin"
	on public.categories for all
	using (public.is_admin())
	with check (public.is_admin());

create policy "regions_modify_admin"
	on public.regions for all
	using (public.is_admin())
	with check (public.is_admin());

create policy "cities_modify_admin"
	on public.cities for all
	using (public.is_admin())
	with check (public.is_admin());

create policy "districts_modify_admin"
	on public.districts for all
	using (public.is_admin())
	with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- reports — жалобы
-- -----------------------------------------------------------------------------
create type public.report_target_type as enum ('listing', 'user', 'event');
create type public.report_status as enum ('open', 'in_review', 'resolved', 'rejected');

create table public.reports (
	id uuid primary key default gen_random_uuid(),
	target_type public.report_target_type not null,
	target_id uuid not null,
	reporter_id uuid not null references auth.users(id) on delete cascade,
	reason text not null,
	comment text,
	status public.report_status not null default 'open',
	created_at timestamptz not null default now(),
	resolved_at timestamptz
);

create index reports_target_idx on public.reports(target_type, target_id);
create index reports_status_idx on public.reports(status);

alter table public.reports enable row level security;

create policy "reports_insert_authenticated"
	on public.reports for insert
	with check (auth.uid() = reporter_id);

create policy "reports_select_own_or_moderator"
	on public.reports for select
	using (reporter_id = auth.uid() or public.is_moderator());

create policy "reports_update_moderator"
	on public.reports for update
	using (public.is_moderator())
	with check (public.is_moderator());
