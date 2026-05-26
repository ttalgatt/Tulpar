-- =============================================================================
-- 20260101000000_init.sql
-- Базовые расширения, профили пользователей, справочники локаций, категории.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- -----------------------------------------------------------------------------
-- profiles — расширение auth.users
-- -----------------------------------------------------------------------------
create table public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	full_name text,
	phone text,
	avatar_url text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, full_name)
	values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
	return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_all"
	on public.profiles for select
	using (true);

create policy "profiles_update_own"
	on public.profiles for update
	using (auth.uid() = id)
	with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- regions / cities / districts
-- -----------------------------------------------------------------------------
create table public.regions (
	id smallserial primary key,
	slug text not null unique,
	name_ru text not null,
	name_kk text not null
);

create table public.cities (
	id serial primary key,
	region_id smallint not null references public.regions(id) on delete cascade,
	slug text not null,
	name_ru text not null,
	name_kk text not null,
	unique (region_id, slug)
);

create index cities_region_idx on public.cities(region_id);

create table public.districts (
	id serial primary key,
	city_id integer not null references public.cities(id) on delete cascade,
	slug text not null,
	name_ru text not null,
	name_kk text not null,
	unique (city_id, slug)
);

create index districts_city_idx on public.districts(city_id);

alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.districts enable row level security;

create policy "regions_select_all" on public.regions for select using (true);
create policy "cities_select_all" on public.cities for select using (true);
create policy "districts_select_all" on public.districts for select using (true);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create type public.category_kind as enum ('pets', 'livestock', 'goods', 'services', 'events');

create table public.categories (
	id serial primary key,
	parent_id integer references public.categories(id) on delete cascade,
	slug text not null unique,
	kind public.category_kind not null,
	name_ru text not null,
	name_kk text not null,
	icon text,
	sort_order integer not null default 100
);

create index categories_parent_idx on public.categories(parent_id);
create index categories_kind_idx on public.categories(kind);

alter table public.categories enable row level security;

create policy "categories_select_all" on public.categories for select using (true);
