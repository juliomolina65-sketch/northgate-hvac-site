-- ============================================================
--  NORTHGATE — Supabase schema (contractor accounts + orders)
--  Run ONCE: Supabase > SQL Editor > New query > paste all > Run.
--  Safe to run again.
-- ============================================================

-- Owners/staff who can approve contractors and set their pricing.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

-- Contractor accounts. Pricing is set by the owner, one contractor at a time.
create table if not exists public.contractors (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now(),
  email                text,
  name                 text,
  company              text,
  phone                text,
  license              text,
  license_state        text,
  volume               text,
  work                 text,
  status               text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  discount_system      integer not null default 0,     -- $ off each complete system
  discount_part        integer not null default 0,     -- $ off each individual part
  discount_commercial  integer not null default 0,     -- $ off each commercial rooftop unit
  prices               jsonb not null default '{}'::jsonb,  -- exact price per item id, e.g. {"trane-3.5t-gas-5ttr5042a1000a": 4300}
  notes                text                             -- owner's private notes
);
alter table public.contractors enable row level security;
alter table public.contractors add column if not exists account_type text;   -- "Contractor / business" or "Local customer (within 2 hours of DFW)"
alter table public.contractors add column if not exists zip text;

-- Northgate sales reps (details and policies further down).
create table if not exists public.reps (
  code        text primary key,                 -- e.g. MIKE (letters/numbers, used in the link)
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null unique,
  phone       text,
  user_id     uuid unique references auth.users(id) on delete set null,   -- filled when the rep signs in
  active      boolean not null default true
);
alter table public.reps enable row level security;
-- Northgate's share of each rep sale (the rep keeps the rest). Admin-only.
alter table public.reps add column if not exists house_pct numeric not null default 15;          -- e.g. 10, 15, 20
alter table public.reps add column if not exists house_basis text not null default 'margin'       -- 'margin' = % of (price - cost); 'sale' = % of the sale
  check (house_basis in ('margin', 'sale'));
alter table public.reps add column if not exists max_discount_system     integer;   -- null = no limit
alter table public.reps add column if not exists max_discount_part       integer;
alter table public.reps add column if not exists max_discount_commercial integer;

-- Your cost per item (item id from the website, e.g. "carrier-3t-electric-ga5san53602w"). Admin writes, reps read (for margins).
create table if not exists public.costs (
  item_id    text primary key,
  cost       numeric not null,
  updated_at timestamptz not null default now()
);
alter table public.costs enable row level security;

-- Contractors can edit their own contact info, but only an admin can change status or pricing.
create or replace function public.protect_contractor_pricing() returns trigger
language plpgsql security definer set search_path = public as $$
declare r public.reps%rowtype;
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.discount_system := 0; new.discount_part := 0;
    new.discount_commercial := 0; new.prices := '{}'::jsonb; new.notes := null;
    return new;
  end if;
  -- A rep may approve and price THEIR OWN customers (within any max discount the admin set for them).
  select * into r from public.reps where user_id = auth.uid() and active;
  if found and old.rep_code = r.code then
    new.prices := old.prices;                                   -- exact per-item prices stay admin-only
    if r.max_discount_system     is not null then new.discount_system     := least(new.discount_system, r.max_discount_system); end if;
    if r.max_discount_part       is not null then new.discount_part       := least(new.discount_part, r.max_discount_part); end if;
    if r.max_discount_commercial is not null then new.discount_commercial := least(new.discount_commercial, r.max_discount_commercial); end if;
    return new;
  end if;
  -- Customers editing their own profile can't touch status or pricing.
  new.status := old.status; new.discount_system := old.discount_system; new.discount_part := old.discount_part;
  new.discount_commercial := old.discount_commercial; new.prices := old.prices; new.notes := old.notes;
  return new;
end $$;
drop trigger if exists protect_contractor_pricing on public.contractors;
create trigger protect_contractor_pricing before insert or update on public.contractors
  for each row execute function public.protect_contractor_pricing();

drop policy if exists "contractor read"   on public.contractors;
drop policy if exists "contractor insert" on public.contractors;
drop policy if exists "contractor update" on public.contractors;
drop policy if exists "contractor delete" on public.contractors;
create policy "contractor read"   on public.contractors for select using (user_id = auth.uid() or public.is_admin());
create policy "contractor insert" on public.contractors for insert with check (user_id = auth.uid());
create policy "contractor update" on public.contractors for update using (user_id = auth.uid() or public.is_admin());
create policy "contractor delete" on public.contractors for delete using (public.is_admin());

-- Orders paid online. Written by the checkout server (service key); read by the buyer and admins.
create table if not exists public.orders (
  id                 bigint generated always as identity primary key,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz,
  stripe_session_id  text unique,
  user_id            uuid references auth.users(id) on delete set null,
  status             text not null default 'pending',   -- pending, processing (bank transfer clearing), paid, failed, abandoned, shipped, picked_up
  total_cents        integer,
  delivery           text,
  items              jsonb,
  meta               jsonb,
  customer_email     text,
  customer_name      text,
  customer_phone     text,
  shipping_address   jsonb,
  payment_method     text
);
alter table public.orders enable row level security;
drop policy if exists "orders read"   on public.orders;
drop policy if exists "orders update" on public.orders;
create policy "orders read"   on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders update" on public.orders for update using (public.is_admin());

-- ============================================================
--  SALES REPS: Northgate reps each have a code (their sign-up link is  yoursite/?rep=CODE).
--  Customers who sign up through a rep's link belong to that rep; their orders count for the rep.
--  Reps are added by an admin (admin.html > Reps). The rep then creates a login with that same email.
-- ============================================================
-- (reps table is created near the top)

create or replace function public.my_rep_code() returns text
language sql stable security definer set search_path = public as $$
  select code from public.reps where user_id = auth.uid() and active;
$$;

-- A rep signs in with the email the admin entered: link that login to the rep row.
create or replace function public.claim_rep() returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  update public.reps set user_id = auth.uid()
   where user_id is null and lower(email) = lower((select email from auth.users where id = auth.uid()))
   returning code into c;
  return coalesce(c, public.my_rep_code());
end $$;

-- Public: rep name for a code (shown as "Referred by ..." on the sign-up form). Nothing else is exposed.
create or replace function public.rep_name(p_code text) returns text
language sql stable security definer set search_path = public as $$
  select name from public.reps where upper(code) = upper(p_code) and active;
$$;

drop policy if exists "reps read" on public.reps;
drop policy if exists "reps admin write" on public.reps;
create policy "reps read" on public.reps for select using (user_id = auth.uid() or public.is_admin());
create policy "reps admin write" on public.reps for all using (public.is_admin()) with check (public.is_admin());

-- Customer profile details + which rep they belong to.
alter table public.contractors add column if not exists rep_code      text references public.reps(code) on update cascade on delete set null;
alter table public.contractors add column if not exists role          text;   -- Contractor / owner, Technician, Salesperson, Local customer...
alter table public.contractors add column if not exists city          text;
alter table public.contractors add column if not exists state         text;
alter table public.contractors add column if not exists service_areas text;   -- cities / counties / ZIPs they serve
alter table public.orders      add column if not exists rep_code      text;

-- Customers can only set their rep when they sign up (from the rep's link); after that only an admin can change it.
create or replace function public.protect_contractor_rep() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.rep_code is not null and not exists (select 1 from public.reps where code = upper(new.rep_code) and active) then
        new.rep_code := null;
      else
        new.rep_code := upper(new.rep_code);
      end if;
    else
      new.rep_code := old.rep_code;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_contractor_rep on public.contractors;
create trigger protect_contractor_rep before insert or update on public.contractors
  for each row execute function public.protect_contractor_rep();

-- Reps can see their own customers and those customers' orders (read-only).
drop policy if exists "rep reads customers" on public.contractors;
create policy "rep reads customers" on public.contractors for select using (rep_code is not null and rep_code = public.my_rep_code());
drop policy if exists "rep reads orders" on public.orders;
create policy "rep reads orders" on public.orders for select using (rep_code is not null and rep_code = public.my_rep_code());

drop policy if exists "rep updates customers" on public.contractors;
create policy "rep updates customers" on public.contractors for update using (rep_code is not null and rep_code = public.my_rep_code());
drop policy if exists "costs read" on public.costs;
drop policy if exists "costs admin write" on public.costs;
create policy "costs read" on public.costs for select using (public.is_admin() or public.my_rep_code() is not null);
create policy "costs admin write" on public.costs for all using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.costs to authenticated;
grant select on public.reps to authenticated;
grant insert, update, delete on public.reps to authenticated;
grant execute on function public.rep_name(text) to anon, authenticated;
grant execute on function public.claim_rep() to authenticated;
grant execute on function public.my_rep_code() to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.contractors to authenticated;
grant delete on public.contractors to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.admins to authenticated;

-- ============================================================
--  AFTER you create your own login on the site (Contractor Pricing > Create account),
--  make yourself the admin by running this with YOUR email:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'you@example.com'
--    on conflict do nothing;
-- ============================================================
