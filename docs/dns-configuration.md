# DNS Configuration — GoDaddy → Netlify

Step-by-step instructions for pointing the GoDaddy-registered domain to the Netlify deployment.

## Prerequisites

- Domain registered with GoDaddy (e.g., `asmautorepair.ca`)
- Site deployed on Netlify (e.g., `asm-autorepair.netlify.app`)
- Access to GoDaddy DNS management dashboard
- Access to Netlify site settings dashboard

---

## Step 1: Get Netlify Site Information

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (e.g., `asm-autorepair`)
3. Go to **Site settings → Domain management**
4. Note your Netlify subdomain: `asm-autorepair.netlify.app`
5. Note the Netlify load balancer IP address (displayed under "DNS configuration" or check [Netlify docs](https://docs.netlify.com/domains-https/custom-domains/) — typically `75.2.60.5`)

---

## Step 2: Add Custom Domain in Netlify

1. In Netlify Dashboard, go to **Site settings → Domain management → Custom domains**
2. Click **Add custom domain**
3. Enter your domain: `asmautorepair.ca`
4. Click **Verify** → Netlify confirms you own the domain
5. Also add `www.asmautorepair.ca` as an alias

---

## Step 3: Configure DNS Records in GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com)
2. Go to **My Products → Domains → DNS** (click "Manage" next to your domain)
3. In the DNS Records section, add/modify the following records:

### A Record (Root Domain)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `75.2.60.5` (Netlify load balancer IP from Step 1) | 3600 |

> **Note:** Replace the IP with the one shown in your Netlify dashboard. Netlify may provide a different IP — always use what's shown in your site's domain settings.

### CNAME Record (www subdomain)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `asm-autorepair.netlify.app` | 3600 |

> Replace `asm-autorepair.netlify.app` with your actual Netlify subdomain.

4. **Remove** any existing A records for `@` that point to GoDaddy's default parking page IP
5. **Remove** any existing CNAME for `www` that points to GoDaddy's default destination
6. Save all changes

---

## Step 4: Set TTL

- TTL (Time to Live) should be set to **3600** seconds (1 hour) for both records
- This means DNS changes propagate within 1 hour for most resolvers
- During initial setup, you can temporarily set TTL to **600** (10 minutes) for faster propagation, then increase to 3600 after confirming everything works

---

## Step 5: Enable HTTPS in Netlify

1. Return to **Netlify Dashboard → Site settings → Domain management → HTTPS**
2. Netlify automatically provisions a free SSL certificate via **Let's Encrypt**
3. Click **Verify DNS configuration** — Netlify checks that your DNS records point correctly
4. Once verified, Netlify issues the certificate (usually within minutes)
5. **Force HTTPS** is enabled by default — all HTTP traffic redirects to HTTPS

---

## Step 6: Wait for DNS Propagation

- DNS propagation can take **up to 48 hours** globally, though it typically completes within 1–4 hours
- Use [dnschecker.org](https://www.dnschecker.org/) to monitor propagation status
- Test by visiting your domain in a browser — you should see the Netlify-deployed site

---

## Verification Checklist

- [ ] `https://asmautorepair.ca` loads the website (root domain)
- [ ] `https://www.asmautorepair.ca` loads the website (www subdomain)
- [ ] HTTP automatically redirects to HTTPS
- [ ] SSL certificate shows as valid (padlock icon in browser)
- [ ] Netlify dashboard shows domain as "verified"

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "DNS_PROBE_FINISHED_NXDOMAIN" | DNS not propagated yet — wait up to 48h |
| Certificate provisioning fails | Ensure A and CNAME records are correct, remove conflicting records |
| Site shows GoDaddy parking page | Old A record still cached — clear browser cache, wait for TTL expiry |
| www works but root doesn't | A record missing or pointing to wrong IP |
| Root works but www doesn't | CNAME record missing or incorrect value |

---

## DNS Record Summary

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | @ | Netlify load balancer IP (from dashboard) | 3600 |
| CNAME | www | `{site-name}.netlify.app` | 3600 |
