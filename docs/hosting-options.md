# Hosting Options

This document compares hosting options for the ASM AUTO Repair website. All options are ≤$20/month. The default deployment target is Netlify Free tier.

## Comparison Summary

| Provider | Monthly Cost | Bandwidth | Key Advantage | Pricing Page |
|----------|-------------|-----------|---------------|--------------|
| Netlify Free (default) | $0 | 100GB | Zero config, auto-deploy from Git | [netlify.com/pricing](https://www.netlify.com/pricing/) |
| Netlify Pro | $19/month | Unlimited | Faster builds, analytics, background functions | [netlify.com/pricing](https://www.netlify.com/pricing/) |
| Cloudflare Pages | $0–$20/month | Unlimited | Unlimited bandwidth, Workers integration | [pages.cloudflare.com](https://pages.cloudflare.com/) |
| VPS (DigitalOcean) | $6/month | 1TB | Full server control, custom configs | [digitalocean.com/pricing](https://www.digitalocean.com/pricing) |
| GoDaddy Hosting | $10–$15/month | Varies | Everything under one vendor (domain + hosting) | [godaddy.com/hosting](https://www.godaddy.com/hosting) |

---

## Netlify Free (Default — Current Setup)

- **Cost:** $0/month
- **Bandwidth:** 100GB/month
- **Build minutes:** 300/month
- **Concurrent builds:** 1
- **Features:** Auto-deploy from Git, serverless functions, form handling, Let's Encrypt HTTPS, branch previews
- **Limitations:** Single concurrent build, 100GB bandwidth cap, 10-second function timeout

This is the default and recommended option for the current scale of the project. The free tier is generous for a local business website.

---

## Netlify Pro

- **Cost:** $19/month (per member)
- **Bandwidth:** Unlimited
- **Build minutes:** 25,000/month
- **Features:** Everything in Free + faster builds, analytics dashboard, background functions (up to 15 min), password-protected deploys, priority support

**Advantage over Free:** Unlimited bandwidth eliminates risk of overage, analytics provide visitor insights without third-party scripts, and background functions support longer-running tasks (useful for Phase 2/3 integrations).

**When to upgrade:** If monthly traffic exceeds 80GB or if analytics/background functions are needed for booking integration.

---

## Cloudflare Pages

- **Cost:** $0 (Free) or $20/month (Pro)
- **Bandwidth:** Unlimited (both tiers)
- **Builds:** 500/month (Free), 5000/month (Pro)
- **Features:** Global CDN (275+ cities), Workers integration for edge logic, automatic image optimization (Pro), Web Analytics

**Advantage over Netlify Free:** Unlimited bandwidth on the free tier, larger global edge network, and Cloudflare Workers for edge compute without cold starts.

**Consideration:** Migration requires updating build configuration and DNS. No native form handling — serverless function needs to be ported to Cloudflare Workers.

---

## VPS (DigitalOcean Droplet)

- **Cost:** $6/month (1 vCPU, 1GB RAM, 25GB SSD)
- **Bandwidth:** 1TB/month
- **Features:** Full root access, custom Nginx/Caddy configuration, cron jobs, any runtime environment, SSH access

**Advantage over Netlify Free:** Complete control over server configuration, no build minute limits, can run background jobs (cron-based rebuilds), and host additional services on the same server.

**Consideration:** Requires manual server setup, SSL configuration (Certbot/Caddy), deployment scripting (rsync or CI/CD pipeline), security updates, and monitoring. Higher maintenance burden.

---

## GoDaddy Hosting

- **Cost:** $10–$15/month (Economy to Deluxe shared hosting)
- **Bandwidth:** Varies by plan (unmetered on most plans)
- **Features:** cPanel access, one-click WordPress (if needed later), email hosting included, domain management in same dashboard

**Advantage over Netlify Free:** If the domain is already registered with GoDaddy, hosting consolidates everything under one vendor — single dashboard for domain, DNS, hosting, and email. Includes email hosting which Netlify does not provide.

**Consideration:** Shared hosting performance is lower than CDN-based solutions. Deployment requires FTP/SFTP upload or Git integration setup. No built-in CI/CD — would need manual upload or external CI pipeline. Not ideal for static sites that benefit from CDN edge delivery.

---

## Recommendation

**Stick with Netlify Free** until traffic or feature requirements justify an upgrade. The free tier provides 100GB bandwidth (sufficient for thousands of monthly visitors), automatic deployments, serverless functions for the quote form, and zero infrastructure maintenance.

**Upgrade path:** If bandwidth approaches 100GB/month or analytics are needed → Netlify Pro ($19/month). If unlimited bandwidth is critical but budget is tight → Cloudflare Pages Free tier.
