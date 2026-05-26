-- =============================================================================
-- 20260101000400_storage.sql
-- Бакеты Storage и политики доступа.
-- =============================================================================

-- listing-photos: публичное чтение, запись авторизованным в свою папку (owner_id/<listing_id>/file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'listing-photos',
	'listing-photos',
	true,
	5 * 1024 * 1024,
	array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'event-covers',
	'event-covers',
	true,
	5 * 1024 * 1024,
	array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'avatars',
	'avatars',
	true,
	2 * 1024 * 1024,
	array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Политики storage.objects (предполагается, что папка верхнего уровня = auth.uid())
create policy "listing_photos_public_read"
	on storage.objects for select
	using (bucket_id = 'listing-photos');

create policy "listing_photos_user_insert"
	on storage.objects for insert
	with check (
		bucket_id = 'listing-photos'
		and auth.uid() is not null
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "listing_photos_user_update"
	on storage.objects for update
	using (
		bucket_id = 'listing-photos'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "listing_photos_user_delete"
	on storage.objects for delete
	using (
		bucket_id = 'listing-photos'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "event_covers_public_read"
	on storage.objects for select
	using (bucket_id = 'event-covers');

create policy "event_covers_moderator_write"
	on storage.objects for insert
	with check (bucket_id = 'event-covers' and public.is_moderator());

create policy "event_covers_moderator_update"
	on storage.objects for update
	using (bucket_id = 'event-covers' and public.is_moderator());

create policy "event_covers_moderator_delete"
	on storage.objects for delete
	using (bucket_id = 'event-covers' and public.is_moderator());

create policy "avatars_public_read"
	on storage.objects for select
	using (bucket_id = 'avatars');

create policy "avatars_user_insert"
	on storage.objects for insert
	with check (
		bucket_id = 'avatars'
		and auth.uid() is not null
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "avatars_user_update"
	on storage.objects for update
	using (
		bucket_id = 'avatars'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "avatars_user_delete"
	on storage.objects for delete
	using (
		bucket_id = 'avatars'
		and (storage.foldername(name))[1] = auth.uid()::text
	);
