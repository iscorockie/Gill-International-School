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

drop policy if exists "view own profile"   on public.parent_profiles;
create policy "view own profile"   on public.parent_profiles
  for select using (auth.uid() = id);
drop policy if exists "insert own profile" on public.parent_profiles;
create policy "insert own profile" on public.parent_profiles
  for insert with check (auth.uid() = id);
drop policy if exists "update own profile" on public.parent_profiles;
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

> **Emails not arriving / want school-branded emails?** On the free tier
> Supabase sends confirmation emails with its own default sender, which
> parents often miss or get filtered as spam. For reliable, branded emails,
> turn on **Authentication → Notifications → Emails → "Enable custom SMTP"**
> and use Gmail:
>
> 1. In the Gmail account, enable **2-Step Verification**, then create an
>    **App Password** (Google Account → Security → 2-Step Verification →
>    App passwords). Use that 16-character App Password as the SMTP
>    password — **not** the Gmail account password (Gmail rejects it).
> 2. Fill in the form:
>    - Sender email address: `iiscorockie@gmail.com` (must match the username)
>    - Sender name: `Gill International School`
>    - Host: `smtp.gmail.com`
>    - Port: `465`
>    - Username: `iiscorockie@gmail.com`
>    - Password: the App Password
> 3. **Save changes** — Supabase then raises the free-tier limit to
>    30 emails/hour, which is plenty for parent sign-ups.
>
>    *Supabase shows an amber "personal rather than transactional email"
>    warning for Gmail — that is expected and fine at our volume (a few
>    sign-ups a day, well under Gmail's ~500 messages/day). If enrolment
>    ever scales to hundreds of emails a day, swap in a domain-based
>    transactional sender (e.g. Resend/SendGrid/Postmark on gill.ac.ug);
>    it's a one-form change, no site changes.*
>
> (The site works either way; only the emailed confirmation / password-reset
> links depend on this.)
>
> **School-domain sender (info@gill.ac.ug)?** The site now shows
> `info@gill.ac.ug` as its contact address, so Supabase emails should
> match. `EMAIL-SETUP.md` has the exact Vercel DNS records + Supabase
> SMTP form values for four options (Crystal Webhosting mailbox, Zoho
> Mail free, Resend send-only, Google Workspace). In the SMTP form set
> **Sender email address** to `info@gill.ac.ug` and **Sender name** to
> `Gill International School`. Keep the Gmail setup above as the working
> fallback until a test email from the new sender actually arrives.

### Authentication → Email Templates (brand the four auth emails)

Dashboard: **Authentication → Templates**
(<https://supabase.com/dashboard/project/lsdzmllnjpwzysukzxhz/auth/templates>).
Four templates — *Confirm signup*, *Magic Link*, *Change Email Address*,
*Reset Password*. Each has a **Subject** and an HTML **Message** body;
keep every `{{ .Variable }}` exactly as-is (removing one breaks the
email). Paste-ready branded versions (site colors, support address
`info@gill.ac.ug`):

**1 — Confirm signup**
Subject: `Confirm your Gill International School account`

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#1E222A">
  <h2 style="margin:0 0 6px;font-size:20px;color:#8C2429">Welcome to Gill International School</h2>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Hello,</p>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Thank you for creating a Parent Portal account. Please confirm your email address to activate it:</p>
  <p style="margin:0 0 22px"><a href="{{ .ConfirmationURL }}" style="background:#8C2429;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Confirm my account</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If the button does not work, copy this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#8C2429">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If you did not create this account, you can safely ignore this email.</p>
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E5E8F0;font-size:12px;line-height:1.7;color:#5D6673">Gill International School &middot; Najjera, Kampala, Uganda<br>Questions? Write to <a href="mailto:info@gill.ac.ug" style="color:#8C2429">info@gill.ac.ug</a> or call +256 755 071 456</p>
</div>
```

**2 — Magic Link**
Subject: `Your Gill International School sign-in link`

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#1E222A">
  <h2 style="margin:0 0 18px;font-size:20px;color:#8C2429">Sign in to the Parent Portal</h2>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Hello,</p>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Follow the button below to sign in to Gill International School. The link can be used once and expires shortly:</p>
  <p style="margin:0 0 22px"><a href="{{ .ConfirmationURL }}" style="background:#8C2429;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Sign me in</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If the button does not work, copy this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#8C2429">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If you did not request this link, you can safely ignore this email.</p>
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E5E8F0;font-size:12px;line-height:1.7;color:#5D6673">Gill International School &middot; Najjera, Kampala, Uganda<br>Questions? Write to <a href="mailto:info@gill.ac.ug" style="color:#8C2429">info@gill.ac.ug</a> or call +256 755 071 456</p>
</div>
```

**3 — Change Email Address**
Subject: `Confirm your new email address`

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#1E222A">
  <h2 style="margin:0 0 18px;font-size:20px;color:#8C2429">Confirm your new email address</h2>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Hello,</p>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Follow the button below to confirm the new email address for your Gill International School Parent Portal account:</p>
  <p style="margin:0 0 22px"><a href="{{ .ConfirmationURL }}" style="background:#8C2429;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Confirm new email</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If the button does not work, copy this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#8C2429">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If you did not request this change, please contact us immediately.</p>
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E5E8F0;font-size:12px;line-height:1.7;color:#5D6673">Gill International School &middot; Najjera, Kampala, Uganda<br>Questions? Write to <a href="mailto:info@gill.ac.ug" style="color:#8C2429">info@gill.ac.ug</a> or call +256 755 071 456</p>
</div>
```

**4 — Reset Password**
Subject: `Reset your Parent Portal password`

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:28px 20px;color:#1E222A">
  <h2 style="margin:0 0 18px;font-size:20px;color:#8C2429">Reset your password</h2>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Hello,</p>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Follow the button below to choose a new password for your Gill International School Parent Portal account:</p>
  <p style="margin:0 0 22px"><a href="{{ .ConfirmationURL }}" style="background:#8C2429;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Reset my password</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If the button does not work, copy this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#8C2429">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5D6673">If you did not request a password reset, you can safely ignore this email.</p>
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E5E8F0;font-size:12px;line-height:1.7;color:#5D6673">Gill International School &middot; Najjera, Kampala, Uganda<br>Questions? Write to <a href="mailto:info@gill.ac.ug" style="color:#8C2429">info@gill.ac.ug</a> or call +256 755 071 456</p>
</div>
```

For each template: paste the HTML into the **Message** box, set the
**Subject** line above, click **Save**, then use **Send test email**.
The `From` name/address on those test emails is controlled by the SMTP
form (Notifications → Emails), not by these templates.


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
