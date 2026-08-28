# Deploying Gill International School — gill.ac.ug

The repo is the single source of truth. Two static deployments from the **same repository** on **Vercel**.

## 1. Main website — `gill.ac.ug`

1. Vercel → **Add New… → Project** → import `iscorockie/Gill-International-School`
2. **Root Directory:** `/` (default) · **Framework Preset:** *Other*
3. Deploy, then **Settings → Domains → add `gill.ac.ug`** (and `www.gill.ac.ug` if desired)
4. DNS at your registrar:
   - `gill.ac.ug` → **A** record `76.76.21.21`
   - `www` → **CNAME** `cname.vercel-dns.com`

## 2. Admin dashboard — `admin.gill.ac.ug`

1. Vercel → **Add New… → Project** → import the **same repo**
2. **Root Directory:** `admin` · **Framework Preset:** *Other*
3. **Settings → Domains → add `admin.gill.ac.ug`**
4. DNS: `admin` → **CNAME** `cname.vercel-dns.com`

## Notes

- No build step, no server, no region setting — static files served from Vercel's global CDN.
- Every push to `main` redeploys both projects automatically (~1 min), including content
  published through the admin dashboard (`content.json` + `media/` at the repo root).
- Dashboard login: username **Admin** + password (see school records). The GitHub publish
  token is entered once per device and stored only in that browser.
- GitHub Pages (`iscorockie.github.io/Gill-International-School`) remains an automatic
  mirror/backup while enabled.


## 3. Pre-school — `preschool.gill.ac.ug`

1. Vercel → **Add New… → Project** → import the **same repo**
2. **Root Directory:** `preschool` · **Framework Preset:** *Other*
3. **Settings → Domains → add `preschool.gill.ac.ug`**
4. DNS: `preschool` → **CNAME** `cname.vercel-dns.com`

The old `preschool.gillschool.ac.ug` can be 301-redirected to the new subdomain once live.

## Repo layout

```
/            main site: index.html, newsletter/, media/, content.json
/admin/      admin dashboard (own Vercel root)
/preschool/  pre-school site (own Vercel root)
```
