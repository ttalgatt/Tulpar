-- 20260101000600_listings_contact_phone.sql
-- Add per-listing contact phone that overrides the seller's profile phone

alter table public.listings
  add column if not exists contact_phone varchar(30) null;
