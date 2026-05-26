-- =============================================================================
-- 20260101000100_listings.sql
-- Объявления, фото, EAV-атрибуты, избранное, full-text поиск, RLS.
-- =============================================================================

create type public.listing_status as enum ('draft', 'pending', 'published', 'archived', 'rejected');
create type public.listing_deal_type as enum ('sale', 'gift', 'exchange');
create type public.listing_unit as enum ('piece', 'head', 'kg');

create table public.listings (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid not null references auth.users(id) on delete cascade,
	category_id integer not null references public.categories(id) on delete restrict,

	region_id smallint references public.regions(id) on delete set null,
	city_id integer references public.cities(id) on delete set null,
	district_id integer references public.districts(id) on delete set null,

	title_ru text,
	title_kk text,
	description_ru text,
	description_kk text,

	price numeric(12, 2),
	currency text not null default 'KZT',
	deal_type public.listing_deal_type not null default 'sale',

	quantity integer,
	unit public.listing_unit,
	is_bulk boolean not null default false,

	status public.listing_status not null default 'draft',

	is_featured boolean not null default false,
	promoted_until timestamptz,
	views_count integer not null default 0,
	rejection_reason text,

	expires_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),

	search_tsv tsvector generated always as (
		setweight(to_tsvector('simple', coalesce(title_ru, '') || ' ' || coalesce(title_kk, '')), 'A') ||
		setweight(to_tsvector('simple', coalesce(description_ru, '') || ' ' || coalesce(description_kk, '')), 'B')
	) stored,

	constraint listings_title_required check (
		coalesce(length(trim(title_ru)), 0) > 0 or coalesce(length(trim(title_kk)), 0) > 0
	)
);

create index listings_owner_idx on public.listings(owner_id);
create index listings_status_idx on public.listings(status);
create index listings_category_idx on public.listings(category_id);
create index listings_region_idx on public.listings(region_id);
create index listings_city_idx on public.listings(city_id);
create index listings_created_idx on public.listings(created_at desc);
create index listings_price_idx on public.listings(price);
create index listings_search_idx on public.listings using gin (search_tsv);
create index listings_title_trgm_idx on public.listings using gin ((coalesce(title_ru, '') || ' ' || coalesce(title_kk, '')) gin_trgm_ops);

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- listing_photos
-- -----------------------------------------------------------------------------
create table public.listing_photos (
	id uuid primary key default gen_random_uuid(),
	listing_id uuid not null references public.listings(id) on delete cascade,
	path text not null,
	order_index integer not null default 0,
	created_at timestamptz not null default now()
);

create index listing_photos_listing_idx on public.listing_photos(listing_id, order_index);

-- -----------------------------------------------------------------------------
-- listing_attributes (EAV)
-- -----------------------------------------------------------------------------
create table public.listing_attributes (
	listing_id uuid not null references public.listings(id) on delete cascade,
	attribute_key text not null,
	value_text text,
	value_num numeric,
	value_bool boolean,
	primary key (listing_id, attribute_key)
);

create index listing_attributes_key_idx on public.listing_attributes(attribute_key);

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------
create table public.favorites (
	user_id uuid not null references auth.users(id) on delete cascade,
	listing_id uuid not null references public.listings(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (user_id, listing_id)
);

create index favorites_listing_idx on public.favorites(listing_id);

-- -----------------------------------------------------------------------------
-- Функция увеличения просмотров
-- -----------------------------------------------------------------------------
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	update public.listings
	set views_count = views_count + 1
	where id = p_listing_id and status = 'published';
end;
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.listing_attributes enable row level security;
alter table public.favorites enable row level security;

-- listings: опубликованные видят все; владелец видит свои в любом статусе
create policy "listings_select_published_or_own"
	on public.listings for select
	using (status = 'published' or owner_id = auth.uid());

create policy "listings_insert_own"
	on public.listings for insert
	with check (owner_id = auth.uid());

create policy "listings_update_own"
	on public.listings for update
	using (owner_id = auth.uid())
	with check (owner_id = auth.uid());

create policy "listings_delete_own"
	on public.listings for delete
	using (owner_id = auth.uid());

-- photos / attributes: видны вместе с listing; пишет владелец
create policy "listing_photos_select"
	on public.listing_photos for select
	using (
		exists (
			select 1 from public.listings l
			where l.id = listing_photos.listing_id
				and (l.status = 'published' or l.owner_id = auth.uid())
		)
	);

create policy "listing_photos_modify"
	on public.listing_photos for all
	using (
		exists (
			select 1 from public.listings l
			where l.id = listing_photos.listing_id and l.owner_id = auth.uid()
		)
	)
	with check (
		exists (
			select 1 from public.listings l
			where l.id = listing_photos.listing_id and l.owner_id = auth.uid()
		)
	);

create policy "listing_attributes_select"
	on public.listing_attributes for select
	using (
		exists (
			select 1 from public.listings l
			where l.id = listing_attributes.listing_id
				and (l.status = 'published' or l.owner_id = auth.uid())
		)
	);

create policy "listing_attributes_modify"
	on public.listing_attributes for all
	using (
		exists (
			select 1 from public.listings l
			where l.id = listing_attributes.listing_id and l.owner_id = auth.uid()
		)
	)
	with check (
		exists (
			select 1 from public.listings l
			where l.id = listing_attributes.listing_id and l.owner_id = auth.uid()
		)
	);

-- favorites: пользователь видит только свои
create policy "favorites_select_own"
	on public.favorites for select
	using (user_id = auth.uid());

create policy "favorites_modify_own"
	on public.favorites for all
	using (user_id = auth.uid())
	with check (user_id = auth.uid());
