# Domain Email for gill.ac.ug — FINAL STATE (27 Sep 2026)

This replaces the old "playbook". The setup below is **live and tested**:
mail for `@gill.ac.ug` is hosted on Crystal Webhosting's server, the website
stays on Vercel, and the parent portal (Next.js App Router) runs on the same
Crystal server.

## Architecture (who does what)

| System | Where | Tech |
|---|---|---|
| Website `gill.ac.ug` | Vercel | Static HTML + vanilla JS (Supabase JS from CDN) |
| Parent portal `portal.gill.ac.ug` | Crystal server (nexus) port 3008 | **Next.js App Router** (Node 21), repo `iscorockie/Gill-School-OS` |
| DNS (all records) | Vercel (ns1/ns2.vercel-dns.com) | Managed in Vercel → Domains → gill.ac.ug |
| Mailboxes & webmail | Crystal server via **Webuzo** panel | `info@gill.ac.ug` |

Server: `nexus.crystalcloudhost.com` → **104.194.11.128** (ReliableSite NYC,
PTR `nexus.crystalcloudhost.com`). Webuzo: `https://nexus.crystalcloudhost.com:2003`
(login `gillacug`). Webmail: Webuzo → **Email → Access Email**.

> History: `mail.gill.ac.ug` first pointed at `102.209.111.249` (another
> Crystal node, Savanna Fibre Kampala) — wrong box, inbound mail never
> arrived. Fixed 27 Sep 2026 by repointing the A record to 104.194.11.128.

## Live DNS records (Vercel → Domains → gill.ac.ug)

| Name | Type | Value | Purpose |
|---|---|---|---|
| `@` | ALIAS | `3f92efefb9d787d1.vercel-dns-017.com` | website |
| `*` | ALIAS | `cname.vercel-dns-017.com` | wildcard → website |
| `mail` | A | `104.194.11.128` | mail server |
| `@` | MX (10) | `mail.gill.ac.ug.` | ONLY MX — all inbound |
| `@` | TXT | `v=spf1 a mx ip4:104.194.11.128 ~all` | SPF |
| `default._domainkey` | TXT | `v=DKIM1; p=MIIBIjANBg…IDAQAB;` | DKIM (selector `default`) |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:admin@gill.ac.ug` | DMARC monitoring |
| `autoconfig`, `autodiscover` | CNAME | `mail.gill.ac.ug.` | mail-client autodiscovery |
| `portal` | A | `104.194.11.128` | portal app (via Webuzo proxy :3008) |
| `@` | TXT | `google-gws-recovery-domain-verification=75785436` | Google Workspace recovery (pending) |
| `75785436` | CNAME | `google.com.` | Google Workspace recovery (pending) |

Zoho Mail was removed completely (MX, TXT, `zmail._domainkey`, `admin` CNAME).

## Supabase SMTP (parent portal auth emails)

Project `gill-parent-portal` (`lsdzmllnjpwzysukzxhz`) — fill in
**Authentication → SMTP Settings**:

| Field | Value |
|---|---|
| Sender email | `info@gill.ac.ug` |
| Sender name | `Gill International School` |
| Host | `mail.gill.ac.ug` (fallback: `nexus.crystalcloudhost.com`) |
| Port | `465` (SSL) |
| Username | `info@gill.ac.ug` |
| Password | *the mailbox password (not stored here)* |

Then set **Minimum interval** = 60 and test at `/register`.

## Portal (Gill-School-OS) nodemailer

Env vars for the Webuzo Node app (port 3008):

```
SMTP_HOST=mail.gill.ac.ug
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@gill.ac.ug
SMTP_PASS=<mailbox password>
MAIL_FROM="Gill International School <info@gill.ac.ug>"
```

## Outstanding checklist

1. **Verify inbound end-to-end** — Gmail → `info@` arrives in webmail;
   "Show original" in Gmail shows SPF/DKIM/DMARC = PASS.
2. **Rotate the DKIM keypair** (recommended — private key was exposed in a
   chat window): Webuzo → Email Deliverability → **Repair** → copy the NEW
   `v=DKIM1…` value → update the `default._domainkey` TXT in Vercel → test.
3. **DMARC `rua` fix** — `admin@gill.ac.ug` has no mailbox: either create it
   (Webuzo → Email Account) or change `rua=mailto:info@gill.ac.ug` in Vercel.
   After a few clean weeks consider `p=quarantine`.
4. **Google Workspace decision** — recovery TXT/CNAME are live; submit
   Google's form only if Workspace is actually wanted. **Never add Workspace
   MX records** while Webuzo mailboxes are in use (one MX destination only).
5. **`portal.gill.ac.ug` SSL** — DNS now resolves to the server; issue a cert
   via Webuzo → SSL (Let's Encrypt) for the portal vhost.

## Troubleshooting quick reference

- **Outbound log:** Webuzo → Email → Track Email Delivery (accept/defer/fail).
- **Stuck outbound:** Email → Email Queue.
- **DKIM/SPF/DMARC panel:** Email → Email Deliverability ("Valid" there only
  means *it thinks so* — confirm in Gmail: ⋮ → Show original).
- **Gmail retry cadence after a DNS fix:** minutes → hours (up to days).
- Old `102.209.111.249` references in any guide are obsolete.
