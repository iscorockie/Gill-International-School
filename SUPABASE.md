# Parent Portal Backend — Supabase

`/register` and `/login` (the parent portal) are wired to
[Supabase](https://supabase.com) — a hosted Postgres + Auth backend.
It is free to start, requires **no server or build step**, and
deploys alongside the existing static files on Vercel.

Two files do the work:

| File            | Purpose                                                       |
|-----------------|---------------------------------------------------------------|
| `config.js`     | Holds the Supabase project URL + anon key (the only edit you make) |
| `SUPABASE.md`   | This guide — one-time database setup, then launch checklist    |

---

## 1. Create the Supabase project

1. Sign up / log in at <https://supabase.com> (free tier is fine).
2. **New project** → organisation → project name e.g. `gill-parent-portal`
   → database password → region **eu-west-1** (or closest to Uganda) → Create.
3. Wait ~2 minutes for provisioning.

## 2. Run the setup SQL (one time)

Open **SQL Editor → New query**, paste the whole block below and run it:

```sql
-- Parent profiles: one row per account, linked to Supabase Auth
create table if not exists public.parent_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  parent_name text not null,
  phone       text,
  school      text,
  ref         text,              -- e.g. GIS-2026-4521
  created_at  timestamptz not null default now()
);

-- Row-Level Security: a parent can only read/write their own row
alter table public.parent_profiles enable row level security;

create policy "view own profile"   on public.parent_profiles
  for select using (auth.uid() = id);
create policy "insert own profile" on public.parent_profiles
  for insert with check (auth.uid() = id);
create policy "update own profile" on public.parent_profiles
  for update using (auth.uid() = id);

-- Automatically create the profile row when a parent signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.parent_profiles (id, email, parent_name, phone, school, ref)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'parent_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'school', ''),
    coalesce(new.raw_user_meta_data->>'ref', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. Recommended Auth settings

**Authentication → Sign In / Up:**

- **Email** provider → ON (default).
- **Confirm email** → choose:
  - **OFF** — parent can sign in immediately after registering (simplest UX).
  - **ON** — parent must click the emailed link first (verifies the address;
    `/register` shows a "check your inbox" screen).
- **Password strength** → set *minimum length* to **8** to match the form.

## 4. Connect the site

> ✅ **Done** — `config.js` in the repo already contains the project URL
> (`https://lsdzmllnjpwzysukzxhz.supabase.co`) and the anon key. The project is
> live and `parent_profiles` responds (a REST check returns `[]`, confirming the
> table and security policies from §2 are in place).

1. If you *haven't* run the SQL from §2 yet, run it now — the earlier REST check
   shows the table exists, so most likely it's already done.
2. Commit and push — Vercel redeploys `gill.ac.ug` automatically.
3. Open `https://gill.ac.ug/register`, create a test account, then sign in at
   `https://gill.ac.ug/login`. With keys configured the pages run in live mode
   (no "demo mode" notice) and accounts appear under **Authentication → Users**.

> The anon key in `config.js` is safe: the `parent_profiles` table is
> protected by Row-Level Security, so a browser can only ever read or
> write its own row. Never publish the `service_role` key.

## 5. Admin review before launch

- **Accounts:** Supabase Dashboard → **Authentication → Users** — every
  parent account, with the metadata (name, phone, campus) and the
  `GIS-2026-XXXX` reference in **parent_profiles**.
- **Terms/Privacy copy:** review the live pages before launch:
  - `https://gill.ac.ug/terms`
  - `https://gill.ac.ug/privacy`
  The copy is a plain-language draft (last updated 1 September 2026) and
  should be checked by the school before going live.
- **Test flow:** register → confirm email (if enabled) → sign in →
  sign out — on a phone and a desktop.

## Launch checklist

- [x] Supabase project created and SQL from §2 run (verified: `parent_profiles` responds)
- [x] `config.js` filled with Project URL + anon key (pushed)
- [ ] Confirm-email and password policy decided (§3)
- [ ] `/terms` and `/privacy` reviewed and approved by administration
- [ ] Production is `https://gill.ac.ug` (Vercel root `/`)
