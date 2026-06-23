# Implementation Plan: ASM AUTO Repair Website

## Overview

Static-first marketing website for ASM AUTO Repair built with Astro 4.x, Preact islands, CSS custom properties, and deployed to Netlify. Implementation follows dependency order: project scaffolding → design tokens → content schemas → data → layout → shared components → pages → interactive islands → SEO → deployment config → documentation.

## Tasks

- [x] 1. Project initialization and configuration
  - [x] 1.1 Initialize Astro 4.x project with Preact integration
    - Run `npm create astro@latest` with empty template
    - Install dependencies: `@astrojs/preact`, `preact`, `@astrojs/sitemap`, `zod`, `tsx`, `vitest`, `fast-check`
    - Configure `astro.config.mjs` with static output mode, Preact integration, and sitemap integration
    - Create `tsconfig.json` with strict mode and Preact JSX settings
    - Create `.env.example` with `FEATURE_BOOKING_ENABLED=false` and `FEATURE_EMAIL_ENABLED=false`
    - _Requirements: 14.1, 14.2, 14.4_

  - [x] 1.2 Set up project directory structure
    - Create all directories per design: `src/components/{layout,shared,home,services,gallery,contact,posts,quote,cta,faq}`, `src/content/{services,posts}`, `src/data/`, `src/pages/{services,posts}`, `src/styles/`, `src/lib/{adapters}`, `src/scripts/`, `public/{fonts,images,icons}`, `netlify/functions/`
    - _Requirements: 14.4, 14.5_

- [x] 2. Design system tokens and typography
  - [x] 2.1 Create global CSS with design tokens
    - Create `src/styles/global.css` with all CSS custom properties from the design (colors, typography, spacing, layout, borders, transitions, touch targets, z-index scale)
    - Include CSS reset (box-sizing, margin reset, img max-width)
    - Add mobile media query overrides for `max-width: 767px`
    - Define utility classes for max-width container and visually-hidden
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 1.4, 1.5_

  - [x] 2.2 Set up font loading with Inter
    - Download Inter variable font subset (Latin, woff2) to `public/fonts/`
    - Create `src/styles/fonts.css` with `@font-face` declarations using `font-display: swap`
    - Add preload link for font file in layout head
    - _Requirements: 1.5, 10.4, 18.5_

- [x] 3. Content collections and schema validation
  - [x] 3.1 Create Astro content collection config with Zod schemas
    - Create `src/content/config.ts` defining `servicesCollection` and `postsCollection` with full Zod validation as specified in design (title, slug, summary, description, benefits, order, startingPrice for services; title, slug, publishedDate, excerpt, featuredImage, author, draft for posts)
    - _Requirements: 2.3, 2.6, 14.3_

  - [ ]* 3.2 Write property test for content schema validation (Property 1)
    - **Property 1: Content Schema Validation Round-Trip**
    - Create `src/content/__tests__/schema.property.test.ts`
    - Use fast-check to generate valid/invalid service and post objects
    - Assert Zod accepts valid objects, rejects invalid with specific error messages
    - **Validates: Requirements 2.3, 2.6, 14.3**

- [x] 4. Static data files
  - [x] 4.1 Create business-info.json
    - Create `src/data/business-info.json` with shop name, address, phone, email, WhatsApp URL, coordinates, hours (Mon–Thu 10–7, Fri 2–7, Sat 12–7, Sun closed), social links, and Google review data (4.4/5)
    - _Requirements: 5.1, 5.4, 19.3, 19.5_

  - [x] 4.2 Create gallery.json, testimonials.json, faq.json, pricing.json, benefits.json
    - Create `src/data/gallery.json` with 6+ placeholder image entries (src, alt, width, height, category)
    - Create `src/data/testimonials.json` with 3+ customer reviews (name, text, rating)
    - Create `src/data/faq.json` with 5+ Q&A items covering payment, appointments, warranty, duration, quotes
    - Create `src/data/pricing.json` with 3+ service pricing items (name, starting price)
    - Create `src/data/benefits.json` with 3+ benefit items (icon name, label)
    - _Requirements: 4.2, 4.4, 1.3, 1.7, 1.8, 19.2_

  - [x] 4.3 Create service content markdown files
    - Create markdown files in `src/content/services/` for each of the 10 required services: Oil Change, Brake Repair, Engine Diagnostics, Electrical Repair, Transmission Service, Suspension Repair, A/C Service, Tire Services, General Maintenance, Pre-Purchase Inspection
    - Each file includes frontmatter (title, slug, summary ≤150 chars, description ≥2 sentences, benefits array 3–6 items, order, startingPrice) and body markdown
    - _Requirements: 2.3, 2.4_

- [x] 5. Utility libraries
  - [x] 5.1 Implement feature flags utility
    - Create `src/lib/feature-flags.ts` with `isFeatureEnabled` and `getEnabledFeatures` functions reading from `import.meta.env`
    - Support flags: `booking` → `FEATURE_BOOKING_ENABLED`, `email` → `FEATURE_EMAIL_ENABLED`
    - Default to `false` for any unset or non-"true"/"1" value
    - _Requirements: 15.3_

  - [ ]* 5.2 Write property test for feature flag resolution (Property 8)
    - **Property 8: Feature Flag Resolution**
    - Create `src/lib/__tests__/feature-flags.property.test.ts`
    - Use fast-check to generate arbitrary string env values
    - Assert returns `true` only for "true" or "1", `false` for everything else
    - **Validates: Requirements 15.3**

  - [x] 5.3 Implement form validation logic
    - Create `src/lib/validation.ts` with validation functions for QuoteRequest fields
    - Validate: name (required, ≤100 chars), mobile (10 digits), email (valid format), workType (from predefined list), carBrand (required), modelName (required), modelYear (1980 to currentYear+1)
    - Return error object with field-specific messages for invalid fields
    - _Requirements: 7.1, 7.4_

  - [ ]* 5.4 Write property test for form validation (Property 6)
    - **Property 6: Form Validation Error Detection**
    - Create `src/lib/__tests__/validation.property.test.ts`
    - Use fast-check to generate invalid QuoteRequest objects
    - Assert error returned for each invalid field, no errors for valid fields
    - **Validates: Requirements 7.4**

  - [x] 5.5 Implement formatting utilities
    - Create `src/lib/format.ts` with date formatting, time formatting, phone number formatting, and WhatsApp URL construction functions
    - WhatsApp URL builder: accepts QuoteRequest, returns valid `https://wa.me/14165168181?text=...` with URI-encoded message
    - _Requirements: 7.2, 5.5, 5.6_

  - [ ]* 5.6 Write property test for WhatsApp URL construction (Property 5)
    - **Property 5: WhatsApp URL Construction**
    - Create `src/lib/__tests__/whatsapp-url.property.test.ts`
    - Use fast-check to generate valid name/workType strings
    - Assert URL is valid, contains encoded name and workType, no unescaped special chars
    - **Validates: Requirements 7.2**

  - [x] 5.7 Implement open/closed status logic
    - Create `src/lib/open-now.ts` with function that takes current time (America/Toronto) and business hours, returns `{ isOpen: boolean, nextOpening?: { day: string, time: string } }`
    - _Requirements: 5.5, 5.6_

  - [ ]* 5.8 Write property test for open/closed status (Property 2)
    - **Property 2: Open/Closed Status Correctness**
    - Create `src/lib/__tests__/open-now.property.test.ts`
    - Use fast-check to generate arbitrary timestamps, assert correct open/closed determination
    - **Validates: Requirements 5.5, 5.6**

- [x] 6. Checkpoint - Core foundations
  - Ensure project builds successfully with `npm run build`, all schema validation passes, and property tests pass with `npm run test`. Ask the user if questions arise.

- [x] 7. Base layout components
  - [x] 7.1 Create SkipToContent component
    - Create `src/components/layout/SkipToContent.astro` — first focusable element, visible on keyboard focus, links to `#main-content`
    - _Requirements: 17.5_

  - [x] 7.2 Create SEOHead component
    - Create `src/components/shared/SEOHead.astro` accepting title, description, canonical, ogImage, type, publishedDate props
    - Render meta title (50–60 chars), meta description (120–160 chars), canonical link, Open Graph tags, and JSON-LD structured data for LocalBusiness
    - _Requirements: 16.1, 16.3, 16.5, 16.6_

  - [ ]* 7.3 Write property test for JSON-LD structured data (Property 9)
    - **Property 9: JSON-LD Structured Data Validity**
    - Create `src/lib/__tests__/jsonld.property.test.ts`
    - Use fast-check to generate valid BusinessInfo objects
    - Assert JSON-LD output conforms to schema.org LocalBusiness with valid fields
    - **Validates: Requirements 16.1**

  - [ ]* 7.4 Write property test for meta title constraints (Property 10)
    - **Property 10: Meta Title Constraint Compliance**
    - Create `src/lib/__tests__/seo-meta.property.test.ts`
    - Assert all page meta titles are 50–60 chars, contain "Toronto", contain service keyword
    - **Validates: Requirements 16.3**

  - [x] 7.5 Create BaseLayout component
    - Create `src/components/layout/BaseLayout.astro` — HTML shell with lang="en", charset, viewport meta, font preload, global CSS import, fonts.css import, SkipToContent, Header slot, `<main id="main-content">`, Footer
    - Integrate SEOHead with per-page props passed down
    - _Requirements: 14.1, 10.4, 18.3, 18.5, 17.5_

  - [x] 7.6 Create Header component
    - Create `src/components/layout/Header.astro` with shop logo, desktop navigation (Home, Services, About, Gallery, Contact, Posts, Quote), primary CTA button
    - Sticky behavior on mobile (visible after scrolling past hero)
    - Include MobileNav island slot for hamburger menu
    - _Requirements: 19.4, 8.2_

  - [x] 7.7 Create Footer component
    - Create `src/components/layout/Footer.astro` with business hours, address (296 Brock Ave, Toronto, ON M6K 2M4), phone ((416) 516-8181), 2+ social media links, secondary navigation menu
    - _Requirements: 19.5_

- [x] 8. Shared components
  - [x] 8.1 Create Card, CTAButton, SectionHeading, and FeatureFlag components
    - Create `src/components/shared/Card.astro` — 24px border-radius, 1px #EAEAEA border, subtle shadow, slot for content
    - Create `src/components/shared/CTAButton.astro` — primary (yellow accent) and secondary variants, min 44x44px touch target, link or button mode
    - Create `src/components/shared/SectionHeading.astro` — h2 with consistent spacing, font-weight 700+, size from tokens
    - Create `src/components/shared/FeatureFlag.astro` — conditionally renders slot based on `isFeatureEnabled(feature)`
    - _Requirements: 10.2, 1.6, 10.3, 10.4, 15.3_

- [x] 9. Homepage components and page
  - [x] 9.1 Create Hero component
    - Create `src/components/home/Hero.astro` — full-viewport section with shop name "ASM AUTO Repair", tagline, primary CTA button to contact/booking, hero background image with `fetchpriority="high"`
    - _Requirements: 1.1, 1.6_

  - [x] 9.2 Create ServicesOverview, Testimonials, Benefits, PricingPreview, WhyChooseUs, ReviewBadge components
    - Create `src/components/home/ServicesOverview.astro` — 4+ service category cards with name and ≤50 word description
    - Create `src/components/home/Testimonials.astro` — 3+ review highlights with customer name and excerpt
    - Create `src/components/home/Benefits.astro` — 3+ icon + label benefit items
    - Create `src/components/home/PricingPreview.astro` — 3+ service items with name and starting price
    - Create `src/components/home/WhyChooseUs.astro` — 4 differentiators (years of experience, latest equipment, done-right guarantee, above-standard service)
    - Create `src/components/home/ReviewBadge.astro` — Google rating badge (4.4/5, review count), hidden if data null/invalid
    - _Requirements: 1.2, 1.3, 1.7, 1.8, 19.1, 19.3, 19.6_

  - [x] 9.3 Create homepage (index.astro)
    - Create `src/pages/index.astro` composing all home components in order: Hero, ServicesOverview, Benefits, WhyChooseUs, Testimonials, ReviewBadge, PricingPreview, Contact CTA section (WhatsApp + address)
    - Use BaseLayout with homepage SEO meta (title ≤60 chars with "Toronto")
    - _Requirements: 1.1–1.9, 16.3_

- [x] 10. Services pages
  - [x] 10.1 Create ServiceCard and ServiceDetail components
    - Create `src/components/services/ServiceCard.astro` — card with service name and summary (≤150 chars), link to detail page, single-column on mobile with 24px rounded border
    - Create `src/components/services/ServiceDetail.astro` — full description (≥2 sentences), 3–6 benefits list, CTA linking to Quote form
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 10.2 Create services listing and dynamic detail pages
    - Create `src/pages/services/index.astro` — list all services from content collection as ServiceCards
    - Create `src/pages/services/[slug].astro` — dynamic route rendering ServiceDetail for each service
    - Include SEO meta with "Toronto" and service keywords per page
    - _Requirements: 2.1, 2.2, 2.4, 16.3_

- [x] 11. About page
  - [x] 11.1 Create About page
    - Create `src/pages/about.astro` with shop history narrative, years of experience, team qualifications, repair philosophy ("done right the first time"), address, phone, email, expertise section, equipment quality section
    - Use BaseLayout with About page SEO meta
    - _Requirements: 3.1, 3.2, 3.3, 16.3_

- [x] 12. Gallery page and Lightbox island
  - [x] 12.1 Create GalleryGrid component
    - Create `src/components/gallery/GalleryGrid.astro` — responsive grid: 1 col <768px, 2 cols 768–1023px, 3 cols ≥1024px, 24px rounded containers
    - Load images from `gallery.json`, show placeholder on image load failure
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 12.2 Create Lightbox island component
    - Create `src/components/gallery/Lightbox.tsx` (Preact, `client:visible`) — fullscreen overlay on image click/tap, close button, dismiss on outside tap
    - _Requirements: 4.3_

  - [x] 12.3 Create Gallery page
    - Create `src/pages/gallery.astro` composing GalleryGrid with Lightbox, loading 6+ placeholder images
    - Use BaseLayout with Gallery page SEO meta
    - _Requirements: 4.1, 4.2, 16.3_

  - [ ]* 12.4 Write property test for image alt text compliance (Property 11)
    - **Property 11: Image Alt Text Compliance**
    - Create `src/lib/__tests__/alt-text.property.test.ts`
    - Use fast-check to verify alt text is 5–125 chars, not a filename, not generic placeholder
    - **Validates: Requirements 16.5**

- [x] 13. Contact page and interactive islands
  - [x] 13.1 Create BusinessHours and ContactInfo components
    - Create `src/components/contact/BusinessHours.astro` — render weekly hours from business-info.json (Mon–Thu 10–7, Fri 2–7, Sat 12–7, Sun Closed)
    - Create `src/components/contact/ContactInfo.astro` — address, phone (tel: link), email, WhatsApp CTA (wa.me link)
    - _Requirements: 5.1, 5.4, 5.7, 5.8_

  - [x] 13.2 Create GoogleMap island component
    - Create `src/components/contact/GoogleMap.tsx` (Preact, `client:visible`) — Google Maps embed iframe for 296 Brock Ave, Toronto
    - Implement fallback: if iframe fails, show linked address text opening Google Maps in new tab
    - _Requirements: 5.2, 5.3_

  - [x] 13.3 Create OpenNowIndicator island component
    - Create `src/components/contact/OpenNowIndicator.tsx` (Preact, `client:load`) — reads client clock in America/Toronto timezone, uses open-now logic to display "Open Now" (distinct bg + contrasting text) or "Closed" with next opening day/time
    - _Requirements: 5.5, 5.6_

  - [x] 13.4 Create Contact page
    - Create `src/pages/contact.astro` composing ContactInfo, BusinessHours, OpenNowIndicator island, GoogleMap island
    - Use BaseLayout with Contact page SEO meta
    - _Requirements: 5.1–5.8, 16.3_

- [x] 14. Checkpoint - Core pages complete
  - Ensure all pages render correctly with `npm run build`, no schema validation errors, site navigable. Ask the user if questions arise.

- [x] 15. Posts/News section
  - [x] 15.1 Create PostCard and Pagination components
    - Create `src/components/posts/PostCard.astro` — title, date, featured image, excerpt (≤160 chars truncated)
    - Create `src/components/posts/Pagination.astro` — prev/next navigation, current page indicator, handles 10 posts per page
    - _Requirements: 6.1, 6.7_

  - [x] 15.2 Create posts listing and detail pages
    - Create `src/pages/posts/index.astro` — list posts newest-first, paginated at 10 per page, show "no posts available" message if empty
    - Create `src/pages/posts/[slug].astro` — full post with title, published date, featured image, body text
    - Use BaseLayout with Posts page SEO meta
    - _Requirements: 6.1, 6.2, 6.6, 6.7, 16.3_

  - [ ]* 15.3 Write property test for posts chronological ordering (Property 3)
    - **Property 3: Posts Chronological Ordering**
    - Create `src/lib/__tests__/post-ordering.property.test.ts`
    - Use fast-check to generate post arrays with distinct dates, assert descending order
    - **Validates: Requirements 6.1**

  - [ ]* 15.4 Write property test for pagination invariant (Property 4)
    - **Property 4: Posts Pagination Invariant**
    - Create `src/lib/__tests__/pagination.property.test.ts`
    - Use fast-check to generate N posts (N > 10), assert ceil(N/10) pages, ≤10 per page, total = N, no duplicates
    - **Validates: Requirements 6.7**

- [x] 16. Quote form page
  - [x] 16.1 Create QuoteForm island component
    - Create `src/components/quote/QuoteForm.tsx` (Preact, `client:load`) — all required fields (name, mobile, email, workType dropdown, carBrand, modelName, modelYear) and optional fields (preferredDate, preferredTime)
    - Integrate client-side validation from `src/lib/validation.ts`, show inline errors adjacent to invalid fields on blur and submit
    - On valid submit: construct WhatsApp URL and open it, POST to `/api/send-email` serverless function for email backup
    - Display success confirmation on submit, mobile-stacked layout below 768px
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 16.2 Create Quote page
    - Create `src/pages/quote.astro` with QuoteForm island inside BaseLayout
    - Use SEO meta with "Toronto" and quote-related keywords
    - _Requirements: 7.1, 16.3_

- [x] 17. Mobile navigation island
  - [x] 17.1 Create MobileNav island component
    - Create `src/components/layout/MobileNav.tsx` (Preact, `client:load`) — hamburger icon toggle, fullscreen overlay with all top-level nav links, min 44x44px touch targets with 8px spacing
    - Show only below 768px viewport, trap focus within overlay when open
    - _Requirements: 8.2, 8.3, 17.2, 17.4_

- [x] 18. Floating CTAs (click-to-call + WhatsApp)
  - [x] 18.1 Create FloatingCTA component
    - Create `src/components/cta/FloatingCTA.astro` — fixed-position at bottom of viewport, phone icon (tel:+14165168181) + WhatsApp icon (wa.me/14165168181 with pre-filled greeting)
    - Visible only ≤768px viewport, hidden on desktop, distinct icons for each action, z-index from tokens
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 19. Sticky header (mobile)
  - [ ] 19.1 Implement sticky header behavior
    - Update Header component to show sticky header (logo + primary CTA) after scrolling past hero section on viewports <768px
    - Use IntersectionObserver or scroll-based CSS for sticky trigger
    - _Requirements: 19.4_

- [x] 20. FAQ accordion
  - [x] 20.1 Create FAQAccordion component
    - Create `src/components/faq/FAQAccordion.astro` — expandable Q&A section using `<details>/<summary>` HTML elements (no JS needed), loads from faq.json
    - Style with design tokens, accessible keyboard interaction built-in
    - _Requirements: 19.2, 17.2_

- [ ] 21. SEO implementation
  - [ ] 21.1 Implement JSON-LD structured data, sitemap, and robots.txt
    - Add JSON-LD `AutoRepair` schema to homepage via SEOHead (name, address, phone, hours, geo, aggregateRating, priceRange, areaServed)
    - Configure `@astrojs/sitemap` integration to generate `sitemap.xml` listing all public pages
    - Create `public/robots.txt` allowing all crawlers on all public pages, referencing sitemap
    - Add canonical URL `<link rel="canonical">` on every page via SEOHead
    - Ensure exactly one `<h1>` per page, no skipped heading levels
    - _Requirements: 16.1, 16.2, 16.4, 16.6_

  - [ ]* 21.2 Write property test for WCAG contrast compliance (Property 7)
    - **Property 7: Design Palette WCAG Contrast Compliance**
    - Create `src/styles/__tests__/contrast.property.test.ts`
    - Use fast-check to enumerate all text/background color pairs from palette
    - Assert 4.5:1 for body text, 3:1 for large text
    - **Validates: Requirements 10.5, 17.1**

- [x] 22. Provider adapter interfaces (design only)
  - [x] 22.1 Create booking and email adapter TypeScript interfaces
    - Create `src/lib/adapters/booking.ts` — `BookingProvider` interface with `getAvailableSlots`, `createAppointment`, `getAppointment`, `updateAppointment`, `cancelAppointment` methods, `createBookingProvider` factory that throws "Phase 2 — not yet implemented"
    - Create `src/lib/adapters/email.ts` — `EmailProvider` interface with `sendEmail` and `sendBatch` methods, `createEmailProvider` factory that throws "Phase 3 — not yet implemented"
    - Include full type definitions (BookingSlot, CreateAppointmentInput, AppointmentResult, Appointment, SendEmailInput, BatchEmailInput, EmailResult, EmailProviderConfig)
    - _Requirements: 15.1, 15.2_

- [ ] 23. Feature flag mechanism integration
  - [ ] 23.1 Wire feature flags into layout and components
    - Use `FeatureFlag.astro` component to gate any future booking/email UI slots in relevant pages
    - Verify that when flags are `false`, zero bytes are shipped for gated content
    - _Requirements: 15.3_

- [ ] 24. Netlify configuration and serverless function
  - [ ] 24.1 Create netlify.toml and build configuration
    - Create `netlify.toml` with build command (`npm run build`), publish dir (`dist`), NODE_VERSION=20, cache headers for fonts (immutable, 1yr) and images (1wk), security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
    - _Requirements: 13.1, 13.4_

  - [ ] 24.2 Create email serverless function
    - Create `netlify/functions/send-quote.ts` — receives QuoteRequest JSON body, validates server-side, sends via Resend API (or configured email provider), returns 200 regardless of email success, logs failures
    - _Requirements: 7.3, 7.7_

- [ ] 25. Fetch posts script
  - [ ] 25.1 Create Google Sheet to Markdown pipeline script
    - Create `scripts/fetch-posts.ts` — reads Google Sheet via public CSV URL, transforms rows to Markdown frontmatter + body, writes to `src/content/posts/{slug}.md`
    - Implement idempotency (skip existing files unless content hash differs)
    - Handle image downloads from Google Drive URLs to `public/images/posts/`
    - Skip malformed rows (missing title/body) with console warning
    - Add `"prebuild": "tsx scripts/fetch-posts.ts"` to package.json scripts
    - _Requirements: 6.3, 6.4, 6.5, 11.1, 11.3_

- [ ] 26. Checkpoint - Full site build
  - Ensure full site builds successfully with `npm run build`, all pages render, schema validation passes, all tests pass with `npm run test`. Ask the user if questions arise.

- [ ] 27. Documentation
  - [ ] 27.1 Create post creation alternatives documentation
    - Create `docs/post-creation-alternatives.md` documenting 4 options with cost, login friction, mobile compatibility, and maintenance burden: Google Form → Sheet (recommended), Git-based CMS (Decap), Hosted headless CMS (Sanity), Custom admin form
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 27.2 Create hosting options and DNS documentation
    - Create `docs/hosting-options.md` listing paid alternatives (Netlify Pro, Cloudflare Pages, VPS, GoDaddy) with cost ≤$20/month, advantages, and pricing links
    - Create `docs/dns-configuration.md` with GoDaddy → Netlify DNS instructions (CNAME/A records, TTL, HTTPS provisioning)
    - _Requirements: 13.2, 13.3_

  - [ ] 27.3 Create Phase 2/3 design documentation
    - Create `docs/phase-2-booking-design.md` documenting appointment schema, integration points for Google Calendar, Excel sheet generation from appointment records
    - Create `docs/phase-3-email-design.md` documenting email template schema, trigger conditions (time-before-appointment thresholds), provider configuration
    - _Requirements: 15.4, 15.5_

  - [ ] 27.4 Create gallery update instructions
    - Create `docs/gallery-update-guide.md` documenting how to update gallery images without CLI, code editing, or desktop tools (developer-facilitated process)
    - _Requirements: 11.4_

- [ ] 28. Performance optimization
  - [ ] 28.1 Implement image optimization and lazy loading
    - Convert placeholder images to WebP format, add responsive `<picture>` with srcset (320w, 640w, 1024w)
    - Add `loading="lazy"` to all below-fold images, explicit width/height attributes
    - Hero image: `fetchpriority="high"`, eager load
    - _Requirements: 18.2, 18.5, 8.5_

  - [ ] 28.2 Implement critical CSS and font loading optimization
    - Ensure Astro inlines critical CSS for above-fold content
    - Add resource hints: `preconnect` to fonts.googleapis.com, `dns-prefetch` to maps.googleapis.com, `preload` for font file
    - Verify font-display: swap is applied, total CSS < 15KB compressed
    - _Requirements: 18.3, 18.5, 18.1_

- [ ] 29. Accessibility audit pass
  - [ ] 29.1 Implement accessibility requirements across all pages
    - Verify skip-to-content link works as first focusable element on every page
    - Add ARIA labels to all interactive components without visible text labels
    - Ensure all form inputs have associated visible `<label>` elements
    - Add visible focus indicators (min 2px outline) on all focusable elements
    - Verify logical tab order matches visual reading order on all pages
    - Verify all images have compliant alt text (5–125 chars, descriptive)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 16.5_

- [ ] 30. Final checkpoint - Production ready
  - Ensure full build passes, all tests pass (`npm run test`), site renders correctly at 320px–2560px viewports, all pages have valid SEO meta, and JSON-LD validates. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based test sub-tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 6, 14, 26, 30) ensure incremental validation
- Property tests use fast-check with Vitest — validate universal correctness properties from the design document
- Phase 2/3 features are interface definitions and documentation only — no runtime implementations
- All interactive components use Preact islands with `client:load` or `client:visible` directives
- Static components (`.astro`) ship zero client JavaScript
- The project uses Astro static output mode — no SSR, no server runtime at deploy time
- The fetch-posts script is idempotent and runs as a prebuild step

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["3.1", "4.1", "4.2", "5.1"] },
    { "id": 4, "tasks": ["3.2", "4.3", "5.2", "5.3", "5.5", "5.7"] },
    { "id": 5, "tasks": ["5.4", "5.6", "5.8"] },
    { "id": 6, "tasks": ["7.1", "7.2", "8.1", "22.1"] },
    { "id": 7, "tasks": ["7.3", "7.4", "7.5"] },
    { "id": 8, "tasks": ["7.6", "7.7"] },
    { "id": 9, "tasks": ["9.1", "9.2", "10.1", "13.1", "15.1"] },
    { "id": 10, "tasks": ["9.3", "10.2", "11.1", "12.1", "13.2", "13.3"] },
    { "id": 11, "tasks": ["12.2", "12.3", "12.4", "13.4", "15.2"] },
    { "id": 12, "tasks": ["15.3", "15.4", "16.1", "17.1"] },
    { "id": 13, "tasks": ["16.2", "18.1", "19.1", "20.1"] },
    { "id": 14, "tasks": ["21.1", "21.2", "23.1"] },
    { "id": 15, "tasks": ["24.1", "24.2", "25.1"] },
    { "id": 16, "tasks": ["27.1", "27.2", "27.3", "27.4"] },
    { "id": 17, "tasks": ["28.1", "28.2"] },
    { "id": 18, "tasks": ["29.1"] }
  ]
}
```
