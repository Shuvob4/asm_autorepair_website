# Requirements Document

## Introduction

ASM AUTO Repair is a Toronto-based auto repair shop located at 296 Brock Ave, Toronto, ON M6K 2M4. This document specifies requirements for a modern, minimalistic marketing and content website built with Astro (static-first). The website serves as the shop's digital presence, providing service information, a gallery, news/posts, quote request functionality, and contact details. The site targets a non-technical smartphone-only maintainer as the primary content operator, and all features must document free and paid tier options (defaulting to free).

The project is phased:
- **Phase 1 (Build):** Home, Services, About, Gallery, Contact/Location, Posts/News, Quote Request Form
- **Phase 2 (Design Only):** Online appointment booking
- **Phase 3 (Design Only):** Automated email reminders

## Glossary

- **Website**: The Astro-based static marketing site for ASM AUTO Repair
- **Maintainer**: The non-technical smartphone-only operator responsible for content updates
- **Visitor**: A potential or existing customer browsing the website
- **Quote_Request_Form**: The form allowing visitors to submit vehicle service estimates
- **Post_System**: The content pipeline for creating news/updates via Google Form → Google Sheet
- **Gallery**: The image showcase section displaying shop work and facilities
- **Service_Page**: Individual or collective pages describing auto repair services offered
- **Contact_Section**: The section displaying business hours, location, phone, and communication channels
- **Build_Pipeline**: The Netlify-based deployment system triggered by content or code changes
- **Content_Collection**: Astro content collections storing services and posts in local markdown/JSON
- **Provider_Adapter**: An abstraction layer allowing swap between free and paid third-party services
- **Feature_Flag**: A configuration mechanism to hide unbuilt features without removing code
- **CTA**: Call-to-action UI element prompting visitor interaction (call, WhatsApp, quote)

## Requirements

### Requirement 1: Homepage Layout and Hero

**User Story:** As a visitor, I want to see an impressive, modern homepage that immediately communicates the shop's professionalism and services, so that I feel confident choosing ASM AUTO Repair.

#### Acceptance Criteria

1. WHEN a Visitor loads the homepage, THE Website SHALL display a hero section fully visible without scrolling that contains the shop name "ASM AUTO Repair", a tagline describing the shop's core value proposition, and a primary CTA button linking to the contact or booking section
2. WHEN a Visitor views the homepage, THE Website SHALL display a services overview section showing at least 4 repair categories, each with a category name and a brief description of no more than 50 words
3. WHEN a Visitor views the homepage, THE Website SHALL display a testimonials section containing at least 3 customer review highlights, each showing a customer name and review excerpt
4. THE Website SHALL render the homepage with the defined color palette (#0A0A0A primary black, #FFFFFF white, #F5C400 luxury yellow accent, #8B8B8B secondary text, #EAEAEA borders)
5. THE Website SHALL use Inter or Geist font family with heading sizes no smaller than 32px on desktop and 24px on mobile, and body text between 14px and 18px across all pages
6. WHEN a Visitor views the homepage on a mobile device, THE Website SHALL display a mobile-optimized layout with touch-friendly CTA buttons no smaller than 44x44 pixels
7. WHEN a Visitor views the homepage, THE Website SHALL display a key benefits section with at least 3 benefit items each represented by an icon and a short label
8. WHEN a Visitor views the homepage, THE Website SHALL display a transparent pricing section showing at least 3 service pricing items with service name and starting price
9. WHEN a Visitor views the homepage, THE Website SHALL display a contact section containing a WhatsApp CTA button and the shop address "296 Brock Ave, Toronto"

---

### Requirement 2: Services Pages

**User Story:** As a visitor, I want to browse all available auto repair services with clear descriptions, so that I can determine whether the shop can handle my vehicle's needs.

#### Acceptance Criteria

1. THE Website SHALL display a services listing page showing all available repair service categories, where each category is presented as a card containing the service name and a short summary of no more than 150 characters
2. WHEN a Visitor selects a service category, THE Website SHALL display a dedicated service detail page containing a description of at least 2 sentences, a list of 3 to 6 key benefits, and a CTA linking to the Quote_Request_Form
3. THE Content_Collection SHALL store service data in local markdown or JSON files editable by the developer, where each service entry includes at minimum: title, slug, short summary, full description, and a list of benefits
4. THE Website SHALL display the following service categories at minimum: Oil Change, Brake Repair, Engine Diagnostics, Electrical Repair, Transmission Service, Suspension Repair, A/C Service, Tire Services, General Maintenance, and Pre-Purchase Inspection
5. WHEN a Visitor views a service page on a viewport below 768px, THE Website SHALL render service cards in a single-column layout with 24px rounded containers and #EAEAEA borders
6. IF a service entry in the Content_Collection is missing a required field (title, slug, short summary, description, or benefits), THEN THE Build_Pipeline SHALL fail the build and output an error message indicating which service entry and field is invalid

---

### Requirement 3: About Page

**User Story:** As a visitor, I want to learn about the shop's history, expertise, and team, so that I can trust them with my vehicle.

#### Acceptance Criteria

1. WHEN a Visitor navigates to the About page, THE Website SHALL display: the shop's history narrative, years of experience (numeric value), the team's qualifications, and the shop's "done right the first time" repair philosophy
2. WHEN a Visitor views the About page, THE Website SHALL display the shop address (296 Brock Ave, Toronto, ON M6K 2M4), a phone number, and an email address
3. WHEN a Visitor views the About page, THE Website SHALL display dedicated content sections for expertise and equipment quality, each containing at least one descriptive paragraph
4. IF the About page fails to load, THEN THE Website SHALL display an error message indicating the content is temporarily unavailable

---

### Requirement 4: Gallery Page

**User Story:** As a visitor, I want to see photos of the shop's work and facilities, so that I can assess their quality before visiting.

#### Acceptance Criteria

1. WHEN a Visitor navigates to the Gallery page, THE Website SHALL display images in a responsive grid layout with 24px rounded containers, rendering 1 column on viewports below 768px, 2 columns on viewports from 768px to 1023px, and 3 columns on viewports 1024px and above
2. THE Gallery SHALL load a minimum of 6 stock placeholder images that the Maintainer can replace with actual photos
3. WHEN a Visitor clicks or taps a gallery image, THE Website SHALL display the image in a lightbox overlay with a visible close button and the ability to dismiss by tapping outside the image
4. THE Gallery SHALL store image references in local files editable by the developer without requiring a CMS login
5. IF a gallery image fails to load, THEN THE Website SHALL display a placeholder graphic in place of the broken image without breaking the grid layout

---

### Requirement 5: Contact and Location Page

**User Story:** As a visitor, I want to quickly find the shop's location, hours, and contact methods, so that I can visit or reach out easily.

#### Acceptance Criteria

1. WHEN a Visitor navigates to the Contact page, THE Website SHALL display the full address (296 Brock Ave, Toronto, ON M6K 2M4), phone number ((416) 516-8181), and email address (the shop's published email)
2. WHEN a Visitor views the Contact page, THE Website SHALL display an embedded Google Maps widget showing the shop location at 296 Brock Ave, Toronto
3. IF the Google Maps widget fails to load, THEN THE Website SHALL display the full street address as a linked fallback that opens Google Maps in a new tab
4. WHEN a Visitor views the Contact page, THE Website SHALL display business hours for each day of the week (Monday–Thursday: 10 a.m.–7 p.m., Friday: 2–7 p.m., Saturday: 12–7 p.m., Sunday: Closed)
5. WHEN the current time in the America/Toronto timezone falls within the shop's posted business hours (inclusive of the start minute, exclusive of the closing minute), THE Website SHALL display an "Open Now" indicator using a distinct background color and a contrasting text label
6. WHEN the current time in the America/Toronto timezone falls outside the shop's posted business hours, THE Website SHALL display a "Closed" indicator with the next opening day and time shown in the format "[Day] [time]" (e.g., "Monday 10 a.m.")
7. WHEN a Visitor taps the phone number, THE Website SHALL initiate a click-to-call action using the tel: protocol
8. WHEN a Visitor taps the WhatsApp CTA, THE Website SHALL open a WhatsApp conversation via the URL https://wa.me/14165168181

---

### Requirement 6: Posts and News Section

**User Story:** As a visitor, I want to read updates and tips from the shop, so that I stay informed and engaged with their services.

#### Acceptance Criteria

1. WHEN a Visitor navigates to the Posts page, THE Website SHALL display a list of posts ordered newest-first, showing each post's title, date, featured image, and an excerpt truncated to a maximum of 160 characters
2. WHEN a Visitor selects a post, THE Website SHALL display the full post content on a dedicated page including the title, published date, featured image, and body text
3. THE Post_System SHALL source content from a Google Sheet populated via a Google Form submission by the Maintainer
4. WHEN the Maintainer submits a Google Form entry, THE Build_Pipeline SHALL trigger a site rebuild and publish the new post within 5 minutes of submission
5. THE Post_System SHALL store fetched content in local markdown or JSON files within the repository after the initial import
6. IF no posts exist in the content source, THEN THE Website SHALL display a message indicating that no posts are available yet
7. WHEN a Visitor navigates to the Posts page and more than 10 posts exist, THE Website SHALL display a maximum of 10 posts per page with navigation to view older posts

---

### Requirement 7: Quote/Estimate Request Form

**User Story:** As a visitor, I want to submit a quote request with my vehicle details, so that I can receive a service estimate without calling.

#### Acceptance Criteria

1. WHEN a Visitor navigates to the quote request form, THE Quote_Request_Form SHALL display the following required fields: name (max 100 characters), mobile number (10-digit format), email, type of work (selectable list), car brand, model name, and model year (between 1980 and the current year + 1); and the following optional fields: preferred date, preferred time
2. WHEN a Visitor submits a valid quote request, THE Quote_Request_Form SHALL send a WhatsApp notification to the shop phone number (416) 516-8181 containing the visitor's name and type of work requested
3. WHEN a Visitor submits a valid quote request, THE Quote_Request_Form SHALL send an email backup notification to the shop email address containing all submitted form fields
4. IF a Visitor submits the form with missing or invalid required fields, THEN THE Quote_Request_Form SHALL display inline validation errors adjacent to each invalid field indicating the specific correction needed
5. WHEN a Visitor successfully submits the form, THE Quote_Request_Form SHALL display a confirmation message acknowledging receipt and indicating expected response time
6. THE Quote_Request_Form SHALL be fully operable on a mobile device without horizontal scrolling, with all form fields stacked vertically on viewports below 768px
7. IF the WhatsApp or email notification delivery fails, THEN THE Quote_Request_Form SHALL still display the success confirmation to the Visitor and log the failure for the developer to review

---

### Requirement 8: Mobile-First Responsive Design

**User Story:** As a visitor using a smartphone, I want the website to be fully functional and visually appealing on my device, so that I can access all information without friction.

#### Acceptance Criteria

1. THE Website SHALL render all page content without horizontal scrollbar and without text truncation at any viewport width from 320px to 2560px, reflowing content to fit the available width
2. WHILE the viewport width is below 768px, THE Website SHALL display a hamburger icon that, when tapped, reveals a navigation menu overlay containing all top-level navigation links
3. WHILE the viewport width is below 768px, THE Website SHALL render all interactive elements (links, buttons, form controls) with a minimum touch target size of 44x44 CSS pixels and a minimum spacing of 8px between adjacent targets
4. THE Website SHALL load with a Largest Contentful Paint (LCP) under 2.5 seconds when measured using a simulated mobile device throttled to 9 Mbps download, 1.5 Mbps upload, and 170ms RTT latency
5. THE Website SHALL achieve a Cumulative Layout Shift (CLS) score below 0.1 on every page when measured over the full page lifecycle
6. WHILE the viewport width is below 768px, THE Website SHALL render body text at a minimum computed font size of 16px and constrain line length to no more than 80 characters per line

---

### Requirement 9: Click-to-Call and WhatsApp CTAs

**User Story:** As a visitor on a mobile device, I want to call or message the shop with one tap, so that I can quickly get in touch.

#### Acceptance Criteria

1. WHILE the viewport width is 768px or less, THE Website SHALL display a fixed-position click-to-call CTA that remains visible during scrolling on every page
2. WHILE the viewport width is 768px or less, THE Website SHALL display a fixed-position WhatsApp CTA that remains visible during scrolling on every page
3. WHEN a Visitor taps the click-to-call CTA, THE Website SHALL initiate a phone call to (416) 516-8181 using the tel:+14165168181 protocol
4. WHEN a Visitor taps the WhatsApp CTA, THE Website SHALL open the URL https://wa.me/14165168181 with a pre-filled greeting message
5. WHILE the viewport width is greater than 768px, THE Website SHALL hide the fixed-position click-to-call and WhatsApp CTAs
6. THE Website SHALL display visually distinct icons for the click-to-call CTA (phone icon) and the WhatsApp CTA (WhatsApp logo) so that a Visitor can differentiate between the two actions without reading text labels

---

### Requirement 10: Design System and Visual Standards

**User Story:** As a developer, I want a consistent design system applied across all pages, so that the website looks cohesive and premium.

#### Acceptance Criteria

1. THE Website SHALL use the following color palette across all pages: #0A0A0A (primary backgrounds and text), #FFFFFF (page backgrounds and light text), #F5C400 (accent elements such as CTAs and highlights), #8B8B8B (secondary/supporting text), #EAEAEA (borders and dividers), with no colors outside this palette used for UI elements unless defined as part of imagery or media content
2. THE Website SHALL use card containers with 24px border radius, a 1px solid border using #EAEAEA, and either no box-shadow or a box-shadow with no more than 4px blur radius and no more than 0.1 opacity
3. THE Website SHALL maintain a minimum of 80px vertical padding between major page sections and a minimum of 24px spacing between content elements within a section, with heading elements having at least 1.5x the spacing below them compared to body text elements
4. THE Website SHALL apply section headings using Inter or Geist font-family at a minimum size of 36px and a font-weight of 700 or higher, and body text at a minimum size of 16px and a font-weight between 400 and 500, establishing a visible size hierarchy where h1 > h2 > h3 each differ by at least 4px
5. IF an element's text color and its background color from the defined palette are combined, THEN THE Website SHALL ensure a minimum contrast ratio of 4.5:1 for body text and 3:1 for headings and large text, as measured by WCAG 2.1 AA standards

---

### Requirement 11: Content Management for Non-Technical Maintainer

**User Story:** As the shop maintainer, I want to add posts from my smartphone without needing technical knowledge or a desktop computer, so that I can keep the website updated independently.

#### Acceptance Criteria

1. THE Post_System SHALL allow the Maintainer to create new posts by filling out a Google Form on a smartphone, collecting the following fields: title (max 120 characters), body text (max 5000 characters), image (file upload or URL), and optional details
2. THE Post_System SHALL require no login to a CMS dashboard, code editor, or desktop-only tool from the Maintainer
3. WHEN the Maintainer submits a Google Form, THE Build_Pipeline SHALL process the submission and deploy the updated site within 10 minutes without Maintainer intervention
4. THE Gallery SHALL support image updates through a process that requires no CLI commands, no code editing, and no desktop-only tools, with the update procedure documented for the developer to facilitate
5. IF the Build_Pipeline fails to deploy after a Google Form submission, THEN THE Build_Pipeline SHALL retain the submitted content in the Google Sheet and notify the developer via the Netlify deployment failure notification

---

### Requirement 12: Post Creation Alternatives Documentation

**User Story:** As a developer, I want documented alternatives for the post creation pipeline with tradeoffs, so that I can recommend upgrades or pivots in the future.

#### Acceptance Criteria

1. THE Website documentation SHALL describe Option 1: Google Form → Google Sheet (recommended) with: free tier cost ($0), login friction (none), mobile compatibility (full smartphone support), and maintenance burden (low — no server to maintain)
2. THE Website documentation SHALL describe Option 2: Git-based CMS with mobile form admin (e.g., Decap CMS) with: free tier cost ($0), login friction (GitHub OAuth required), mobile compatibility (partial — mobile browser UI is cramped), and maintenance burden (moderate — requires Git identity proxy config)
3. THE Website documentation SHALL describe Option 3: Hosted headless CMS studio (e.g., Sanity) with: free tier cost ($0 up to usage limits), login friction (studio login required), mobile compatibility (partial — studio not optimized for small screens), and maintenance burden (moderate — schema migrations needed for content model changes)
4. THE Website documentation SHALL describe Option 4: Custom admin form with: free tier cost ($0 self-hosted), login friction (custom auth required), mobile compatibility (full if built mobile-first), and maintenance burden (high — custom code to build and maintain)
5. THE Website documentation SHALL identify Google Form → Google Sheet as the primary recommended option due to zero login friction, full smartphone-only compatibility, and lowest maintenance burden

---

### Requirement 13: Hosting and Deployment

**User Story:** As a developer, I want clear hosting and deployment requirements with free and paid tiers, so that I can set up infrastructure within budget.

#### Acceptance Criteria

1. THE Build_Pipeline SHALL deploy the Website to Netlify free tier from a Git repository as the default hosting option, operating within Netlify free tier limits (100GB bandwidth, 300 build minutes/month, 1 concurrent build)
2. THE Website documentation SHALL list each paid hosting alternative (Netlify Pro, Cloudflare Pages, VPS, GoDaddy hosting) with its monthly cost (not exceeding $20/month), at least one advantage over the free tier, and a link to the provider's pricing page
3. THE Website documentation SHALL include DNS configuration instructions specifying how to create a CNAME or A record in GoDaddy's DNS settings pointing to the Netlify deployment URL
4. WHEN a Git push to the main branch occurs, THE Build_Pipeline SHALL trigger an automatic deployment to Netlify within 60 seconds of the push event
5. WHEN a Google Sheet content change occurs, THE Build_Pipeline SHALL trigger a site rebuild via a Netlify build hook (webhook URL) invoked by Google Apps Script or Zapier
6. IF a deployment or rebuild trigger fails, THEN THE Build_Pipeline SHALL report the failure status through Netlify's deployment dashboard with an indication of the failure cause

---

### Requirement 14: Static-First Architecture with Astro

**User Story:** As a developer, I want the site built with Astro in a static-first architecture, so that it loads fast, costs nothing to host, and has no vendor lock-in.

#### Acceptance Criteria

1. THE Website SHALL be built using Astro framework with static output mode generating pre-rendered HTML pages at build time
2. THE Website SHALL use Astro islands architecture with client directives (client:load or client:visible) for interactive components (forms, maps, open-now indicator) while rendering all non-interactive content as static HTML requiring no client-side JavaScript
3. THE Content_Collection SHALL use Astro content collections with Zod schema validation for services and posts, stored as local Markdown or JSON files within the repository
4. THE Website build process SHALL produce a self-contained static output directory containing only HTML, CSS, JavaScript, and static asset files with no server-side runtime, no SSR mode, and no server dependencies required for deployment
5. THE Website source code and content SHALL be stored in a Git repository fully owned by the developer, with all content in portable formats (Markdown or JSON), no proprietary CMS dependency, and no vendor-specific APIs required at build time or runtime
6. WHEN a developer clones the repository and runs the build command, THE Website SHALL produce a deployable static output without requiring any external services or API keys for the build to succeed

---

### Requirement 15: Provider Adapter Abstraction for Deferred Features

**User Story:** As a developer, I want provider-abstracted interfaces for future email and calendar integrations, so that I can swap implementations between free and paid tiers without rewriting application logic.

#### Acceptance Criteria

1. THE Website codebase SHALL define a TypeScript interface for appointment booking (Phase 2 — design only) that declares methods for creating, reading, updating, and cancelling appointments, with implementations planned for Cal.com, Google Calendar, Calendly, and Acuity
2. THE Website codebase SHALL define a TypeScript interface for email notifications (Phase 3 — design only) that declares methods for sending single emails and batch emails, with implementations planned for Resend, Brevo, and SendGrid
3. THE Website codebase SHALL use Feature_Flag configuration via environment variables (FEATURE_BOOKING_ENABLED, FEATURE_EMAIL_ENABLED) defaulting to "false", which when set to "false" prevents any booking or email UI from rendering
4. THE Website documentation SHALL document the Phase 2 appointment booking data model including: appointment schema (customer name, phone, email, service type, vehicle info, date, time, status), integration points for Google Calendar event creation, and Excel sheet auto-generation from appointment records
5. THE Website documentation SHALL document the Phase 3 notification interface including: email template schema (recipient, subject, body, variables), trigger conditions (time-before-appointment thresholds), and provider configuration (API key, sender address, reply-to)

---

### Requirement 16: SEO and Local Search Optimization

**User Story:** As the shop owner, I want the website to appear in local search results for auto repair in Toronto, so that new customers can find the business online.

#### Acceptance Criteria

1. THE Website SHALL include structured data (JSON-LD) for LocalBusiness schema with the shop's name, address, phone, hours, and services, and the structured data SHALL pass schema.org validation with zero errors
2. THE Website SHALL generate semantic HTML with exactly one h1 element per page and no skipped heading levels (e.g., h2 must not be followed directly by h4)
3. THE Website SHALL include a unique meta title (50–60 characters) and meta description (120–160 characters) on each page, each containing the term "Toronto" and at least one service-related keyword
4. THE Website SHALL generate a sitemap.xml listing all public pages and a robots.txt that permits crawling of all public pages by search engines, both produced at build time
5. THE Website SHALL include non-empty alt text on all images, where the alt text is between 5 and 125 characters and does not consist solely of a filename or generic placeholder (e.g., "image", "photo")
6. THE Website SHALL include a canonical URL meta tag on every page pointing to that page's preferred URL

---

### Requirement 17: Accessibility Standards

**User Story:** As a visitor with accessibility needs, I want the website to be navigable and readable with assistive technology, so that I can access all content and services.

#### Acceptance Criteria

1. THE Website SHALL achieve WCAG 2.1 Level AA compliance for color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) across all text and background combinations
2. THE Website SHALL support keyboard navigation for all interactive elements including forms, menus, and CTAs, with a visible focus indicator (minimum 2px outline or equivalent) on every focusable element
3. THE Website SHALL include ARIA labels on all interactive components that lack visible text labels, and all form inputs SHALL have an associated visible label element
4. THE Website SHALL maintain a logical tab order matching the visual reading order on all pages
5. THE Website SHALL include a skip-to-main-content link as the first focusable element on every page, visible on keyboard focus

---

### Requirement 18: Performance Budget

**User Story:** As a visitor on a mobile network, I want the website to load quickly, so that I do not abandon it due to slow performance.

#### Acceptance Criteria

1. THE Website SHALL produce a total page weight below 500KB (compressed) for the homepage on initial load, and below 800KB (compressed) for any other page on initial load
2. THE Website SHALL lazy-load images that are positioned below the initial viewport using native loading="lazy" attributes
3. THE Website SHALL inline CSS required for above-the-fold content rendering and defer all remaining stylesheets using non-render-blocking loading techniques
4. THE Website SHALL achieve a Google Lighthouse performance score of 90 or above on mobile when tested using Lighthouse's default mobile throttling profile (simulated 4G with 4x CPU slowdown) against the homepage and at least one content-heavy page
5. THE Website SHALL load fonts using font-display: swap and preload font files so that the Largest Contentful Paint occurs within 2.5 seconds under Lighthouse default mobile throttling conditions
6. THE Website SHALL produce a Cumulative Layout Shift score of 0.1 or less on all pages when measured by Lighthouse under default mobile throttling conditions

---

### Requirement 19: Additional Recommended Features (Phase 1)

**User Story:** As the shop owner, I want additional features appropriate for a local auto repair shop, so that the website maximizes customer engagement and trust.

#### Acceptance Criteria

1. THE Website SHALL display a "Why Choose Us" section containing at least 4 differentiators presented as individually distinguishable items: years of experience, latest equipment, done-right-first-time guarantee, and above-standard customer service
2. THE Website SHALL display a FAQ section containing at least 5 question-and-answer pairs in an expandable accordion format, covering at minimum: accepted payment methods, whether an appointment is needed, warranty on repairs, typical repair duration, and how to request a quote
3. THE Website SHALL display a Google review rating badge showing the numeric star rating (4.4 out of 5) and the total review count, sourced from a one-time data import stored in a local data file
4. WHEN a Visitor scrolls past the hero section on a viewport below 768px wide, THE Website SHALL display a sticky header containing the shop logo and the primary CTA button that remains visible at the top of the viewport during further scrolling
5. THE Website SHALL include a footer on every page containing: business hours for each day of the week, the shop address (296 Brock Ave, Toronto, ON M6K 2M4), the phone number ((416) 516-8181), at least 2 social media links, and a secondary navigation menu linking to all main site pages
6. IF the one-time data import for the Google review rating is unavailable or contains invalid data, THEN THE Website SHALL hide the social proof badge rather than displaying incomplete or default values
