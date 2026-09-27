# Domain Email for gill.ac.ug — Setup Playbook

Goal: Supabase portal emails (confirmations, password resets) sent from
**info@gill.ac.ug** as **"Gill International School"** instead of the
temporary Gmail sender.

**Current working state** (verified 27 Sep 2026):

- The site's contact email is **`info@gill.ac.ug`** everywhere (footers,
  mailtos, terms/privacy).
- Domain mail DNS is **live** — MX → `mail.gill.ac.ug` (104.194.11.128),
  SPF `v=spf1 a mx ip4:104.194.11.128 ~all`, DKIM (`default._domainkey`),
  DMARC `p=none` (reports to `admin@gill.ac.ug`) — i.e. Option A is set up
  and the Crystal SMTP host is confirmed as **`mail.gill.ac.ug`**.
- Supabase custom SMTP (Authentication → Notifications → Emails) is
  configured with the Option A values below and **verified on 27 Sep
  2026** — a test email sent from the dashboard arrived as
  **"Gill International School" \<info@gill.ac.ug\>**. No fallback needed;
  the old `iiscorockie@gmail.com` config can be forgotten (see
  `SUPABASE.md` §3 for history).

> ⚠️ If you chose **Option C (Resend)**, it is send-only: replies to
> `info@gill.ac.ug` will bounce. Make sure the mailbox actually exists
> (Options A/B/D) or forward/monitor replies another way before the
> school advertises this address.

## Where the DNS records go

Domain facts (whois, Sep 2026):

- Registered via **Crystal Webhosting**, Kampala — +256 701 666 661,
  expires 28 Aug 2027
- **DNS is hosted on Vercel** (ns1/ns2.vercel-dns.com)

So every record below is added at:

> **Vercel Dashboard → your project (or account menu → Domains) →
> gill.ac.ug → DNS → "Add Record"**
>
> Root-domain records use Name **`@`**. TTL: default/auto.
> **Never delete the existing A / CNAME records** — they serve the website;
> MX/TXT records are independent and can't break the site.

> **Heads-up — the Crystal "DNS Management" panel shows "An issue was
> encountered while retrieving the DNS records. Please contact support."**
> That is expected and harmless: Crystal is only the *registrar*; the zone
> lives on Vercel's nameservers (`ns1/ns2.vercel-dns.com`), so Crystal's
> DNS editor has nothing to read. Don't add records there (they'd be
> ignored) and never point the nameservers back to Crystal unless the
> whole zone is migrated first — the website would go down.

After adding records, DNS can take a few minutes to a couple of hours to
propagate.

---

## Option A — Crystal Webhosting mailbox (ask them first — may be included)

Call **+256 701 666 661**:

> "The domain gill.ac.ug is registered with you. Does my package include
> email hosting? I'd like a mailbox — e.g. **info@gill.ac.ug** — and the
> SMTP details."

If yes, they create the mailbox and give you the SMTP host/port + password.
They usually also tell you the MX/SPF records to add — paste any they give
into Vercel DNS (tables below are what those records will look like).

**Supabase form** (Authentication → Notifications → Emails → SMTP):

| Field | Value |
|---|---|
| Sender email address | `info@gill.ac.ug` |
| Sender name | `Gill International School` |
| Host | `mail.gill.ac.ug` *(confirmed live)* |
| Port | `465` |
| Username | `info@gill.ac.ug` |
| Password | *(the mailbox password they give you)* |

---

## Option B — Zoho Mail (free: up to 5 mailboxes, real inboxes)

Best free option if you also want staff to *receive* mail on the domain
(info@gill.ac.ug, accounts@gill.ac.ug, …). Forever-Free plan: 5 users,
5 GB each, no credit card. (Free tier = webmail + mobile app; outgoing
SMTP — what Supabase needs — is included.)

**Step 1 — Sign up & add the domain**
Go to **mail.zoho.com → Sign Up** (verify the phone number by OTP) →
pick **Forever Free** → choose **use your own domain** → enter
`gill.ac.ug`. Pick the data center Zoho offers for your region.

> ⚠️ The data center decides the record suffix (US → `zoho.com`,
> India → `zoho.in`, EU → `zoho.eu` …). **Always copy the exact values
> Zoho shows you** — from *Admin Console → Domains* (MX) and
> *Tools & Configurations* (SPF/DKIM) — never trust a generic list.

**Step 2 — Verify domain ownership (temporary record)**
Zoho shows a verification TXT value that looks like:

```
zoho-verification=zbXXXXXXXX.zmverify.zoho.in
```

Add it in **Vercel DNS** (Type `TXT`, Name `@`, Value = that exact string)
→ back in Zoho click **Verify TXT Record** → green check. You may delete
this record afterwards.

**Step 3 — Create the mailbox**
In the Zoho admin, add your first user (it becomes the super-admin
mailbox): **info@gill.ac.ug** → set a strong password.

**Step 4 — Add the mail records in Vercel DNS**
From **Admin Console → Domains → Manage DNS Records**, add exactly what
it lists. The standard (US/international DC) set:

   **Add in Vercel DNS:**

   | Type | Name | Value | Priority |
   |---|---|---|---|
   | MX | `@` | `mx.zoho.com` | 10 |
   | MX | `@` | `mx2.zoho.com` | 20 |
   | MX | `@` | `mx3.zoho.com` | 50 |
   | TXT | `@` | `v=spf1 include:zoho.com ~all` | — |

   | TXT (DKIM) | `zoho._domainkey` *(Zoho shows the exact Name)* | `v=DKIM1; k=rsa; p=…` *(Zoho-generated — copy verbatim)* | — |
4. **Step 5 — Verify** in Zoho: MX / SPF / DKIM should all show green.
   Test: send a mail from info@ to your Gmail, and from Gmail to info@.

**Supabase form:**

| Field | Value |
|---|---|
| Sender email address | `info@gill.ac.ug` |
| Sender name | `Gill International School` |
| Host | `smtp.zoho.com` |
| Port | `465` |
| Username | `info@gill.ac.ug` |
| Password | *(the info@ mailbox password)* |

---

## Option C — Resend (free: 3,000 emails/mo, send-only, best deliverability)

No inbox — emails just go **out** as info@gill.ac.ug. Purpose-built for
transactional mail, so it sidesteps Supabase's "personal provider" warning.

1. Sign up at **resend.com** → **Domains → Add Domain** → `gill.ac.ug`.
2. Resend shows the exact verification records (2–3 TXT records, Names look
   like `k1._domainkey`, `k2._domainkey`, …). Add them verbatim in Vercel DNS.
   Domain shows **Verified** within a few minutes.
3. **API Keys → Create API Key** (scope: Sending). Copy the `re_…` key —
   shown once.

**Supabase form:**

| Field | Value |
|---|---|
| Sender email address | `info@gill.ac.ug` |
| Sender name | `Gill International School` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` *(the literal word, lowercase)* |
| Password | *(the `re_…` API key)* |

Note: with send-only, replies to the emails have nowhere to land — keep the
site's contact email as a real inbox (Gmail today, Option A/B later).

---

## Option D — Google Workspace (paid: ~US$7/user/mo, 30-day trial)

The most familiar option; also gives inboxes.

**Add in Vercel DNS:**

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `@` | `ASPP3.L.GOOGLEMAIL.COM` | 1 |
| MX | `@` | `ASPP5.L.GOOGLEMAIL.COM` | 5 |
| MX | `@` | `ASPP2.L.GOOGLEMAIL.COM` | 5 |
| MX | `@` | `ASPP4.L.GOOGLEMAIL.COM` | 10 |
| MX | `@` | `ASPP.L.GOOGLEMAIL.COM` | 10 |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | — |

Optional DKIM: Google Admin → Apps → Gmail → Settings → *Set up custom
signature / DKIM* — it generates one more TXT (Name `google._domainkey…`).

**Supabase form:**

| Field | Value |
|---|---|
| Sender email address | `info@gill.ac.ug` |
| Sender name | `Gill International School` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `info@gill.ac.ug` |
| Password | *(the Workspace password — or an App Password if 2SV is on)* |

---

## After the DNS records are live

1. ✅ **Done** — Fill the Supabase SMTP form (table for your chosen
   option) → **Save changes**. Leave **Minimum interval per user** at `60`.
2. ✅ **Done (27 Sep 2026)** — **Test:** the dashboard test email arrived
   from **"Gill International School" \<info@gill.ac.ug\>**. (Still worth a
   real end-to-end check: register a throwaway account at
   `gill.ac.ug/register`.)
3. ~~Optional polish: switch the site's contact email from
   `info.gillschool@gmail.com` to `info@gill.ac.ug`~~ — ✅ **Done**:
   all site pages (footers, "Forgot password?", "Talk to Admissions",
   terms & privacy) now use `info@gill.ac.ug`.
4. Brand the four auth emails (Confirm signup, Magic Link, Change Email
   Address, Reset Password) in **Authentication → Templates** — paste-ready
   HTML is in `SUPABASE.md` §3.

## Why not the Vercel Marketplace Supabase?

That marketplace flow provisions a **second, separate Supabase database**.
This site is static and reads its Supabase URL + key from `config.js`, so
the marketplace project would connect to nothing. Keep the existing
`lsdzmllnjpwzysukzxhz` project for everything.
