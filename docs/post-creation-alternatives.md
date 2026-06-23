# Post Creation Pipeline — Alternatives Documentation

This document compares four options for the ASM AUTO Repair post creation pipeline. The primary audience is the developer making infrastructure decisions.

## Comparison Summary

| Option | Cost | Login Friction | Mobile Compatibility | Maintenance |
|--------|------|---------------|---------------------|-------------|
| Google Form → Sheet (✅ RECOMMENDED) | $0 | None | Full smartphone support | Low |
| Decap CMS (Git-based) | $0 | GitHub OAuth | Partial (cramped UI) | Moderate |
| Sanity (Headless CMS) | $0 (limits) | Studio login | Partial (not optimized for small screens) | Moderate |
| Custom Admin Form | $0 (self-hosted) | Custom auth | Full (if built mobile-first) | High |

---

## Option 1: Google Form → Google Sheet (✅ RECOMMENDED)

### How It Works

The maintainer fills out a Google Form on their smartphone (title, body, image URL/upload). The form auto-populates a Google Sheet. A Google Apps Script trigger detects the new row and sends a POST request to a Netlify build hook. The build pipeline runs `fetch-posts.ts`, which reads the Sheet via public CSV or Sheets API, converts rows to Markdown files, and deploys the updated site.

### Pros

- Zero cost — entirely free Google and Netlify services
- Zero login friction — the maintainer only needs the form URL bookmarked
- Full smartphone compatibility — Google Forms is optimized for mobile browsers
- Low maintenance — no server, no database, no custom code for content input
- Built-in data validation via Google Form field rules
- Content is preserved in Google Sheet even if deploys fail

### Cons

- Limited formatting — body text is plain text (no rich text editor)
- Image handling requires either a URL or Google Drive upload (no drag-and-drop inline)
- Rebuild takes 2–5 minutes, not instant
- Sheet structure is rigid — schema changes require form + script updates

### Why Recommended

This option is recommended because it delivers zero login friction, full smartphone-only compatibility, and the lowest maintenance burden. The maintainer never touches a CMS dashboard, code editor, or desktop tool. It aligns perfectly with the non-technical smartphone-only operator requirement.

---

## Option 2: Git-based CMS (Decap CMS)

### How It Works

Decap CMS (formerly Netlify CMS) provides a web-based admin UI that commits content directly to the Git repository. The maintainer navigates to `/admin` on the deployed site, authenticates via GitHub OAuth, and uses a form-based editor to create posts. Each save creates a Git commit, which triggers a Netlify rebuild.

### Pros

- Zero hosting cost — runs as a static page within the existing site
- Content is version-controlled in Git with full history
- Rich text editor with markdown preview
- Supports image uploads via Git LFS or media folders
- No external data store dependency

### Cons

- Requires GitHub OAuth login — the maintainer needs a GitHub account
- Mobile browser UI is cramped and not optimized for small screens
- Moderate maintenance — requires Git identity proxy configuration and Netlify Identity setup
- Schema changes require editing `config.yml` and understanding CMS widget types
- OAuth flow can be confusing for non-technical users

### When to Consider

Choose Decap if the maintainer is comfortable with GitHub login and primarily uses a tablet or desktop for content editing.

---

## Option 3: Hosted Headless CMS (Sanity)

### How It Works

Sanity provides a hosted studio (web application) for managing structured content. The developer defines content schemas in code, deploys a Sanity Studio, and the maintainer logs into the studio to create/edit posts. A webhook notifies Netlify to rebuild when content changes. The build script fetches content via Sanity's GROQ API.

### Pros

- Zero cost up to usage limits (free tier: 100K API requests/month, 500MB assets)
- Powerful structured content model with real-time collaboration
- Built-in image pipeline with automatic transformations
- Content API allows reuse across multiple platforms
- Excellent developer experience for schema management

### Cons

- Studio login required — the maintainer needs Sanity account credentials
- Studio is not optimized for small screens — partial mobile compatibility
- Moderate maintenance — schema migrations needed for content model changes
- Introduces external dependency (Sanity cloud service)
- Free tier limits may be hit with heavy image uploads
- Additional build complexity (API fetching, environment variables for project ID)

### When to Consider

Choose Sanity if the project grows to need structured content across multiple channels or if the maintainer will use a tablet/desktop for content management.

---

## Option 4: Custom Admin Form

### How It Works

A custom-built admin form (web page with authentication) allows the maintainer to create posts. The form submits to a serverless function (Netlify Function) that writes content to the Git repository via GitHub API or stores it in a lightweight database (e.g., SQLite on a VPS, or a JSON file in the repo). A rebuild is triggered after each submission.

### Pros

- Zero cost if self-hosted on existing infrastructure
- Full mobile compatibility if built mobile-first
- Complete control over UI, UX, and validation
- Can match the exact workflow the maintainer prefers
- No third-party service dependency for content input

### Cons

- High maintenance — custom code to build, test, and maintain
- Custom authentication required (password, magic link, or similar)
- Security responsibility falls entirely on the developer
- Image upload, storage, and optimization must be implemented manually
- Any feature additions (drafts, scheduling, previews) require custom development
- No built-in version history unless explicitly implemented

### When to Consider

Choose this option only if the project has very specific workflow requirements that no existing tool satisfies, and the developer has bandwidth for ongoing maintenance.

---

## Recommendation Rationale

**Google Form → Google Sheet** is the primary recommended option because:

1. **Zero login friction** — the maintainer never needs to remember credentials or navigate an auth flow
2. **Full smartphone-only compatibility** — Google Forms works flawlessly on any mobile browser
3. **Lowest maintenance burden** — no server, no CMS, no custom auth to maintain
4. **Content safety** — posts are preserved in Google Sheet even if deployments fail
5. **Aligned with project constraints** — designed for a non-technical, smartphone-only operator
