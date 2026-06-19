# On-Page SEO Implementation Guide – Infrio India

This document describes where each SEO element lives and how to maintain it for Google ranking and Search Console.

---

## 1. Where each piece of code is placed

| Element | Location | Purpose |
|--------|----------|---------|
| **Meta tags (default)** | `public/index.html` `<head>` | Default title, description, canonical, keywords, author. Used when a route does not set its own. |
| **Open Graph tags (default)** | `public/index.html` `<head>` | Default OG and Twitter Card for sharing. Per-route overrides via `<SEO>`. |
| **Structured Data (JSON-LD)** | `public/index.html` `<head>` – `<script type="application/ld+json">` | Organization + LocalBusiness schema for the whole site. |
| **Per-page SEO** | `src/components/Common/SEO.jsx` | Reusable component; used inside page components. |
| **HelmetProvider** | `src/index.js` | Wraps `<App />` so react-helmet-async can update `<head>` per route. |
| **robots.txt** | `public/robots.txt` | Crawler rules and Sitemap URL. Served at `https://www.infrioindia.com/robots.txt`. |
| **sitemap.xml** | `public/sitemap.xml` | List of indexable URLs. Served at `https://www.infrioindia.com/sitemap.xml`. |

---

## 2. Meta tags (optimized for Google)

- **Title**: “Infrio India – Architecture, Design & Build Experts” (default). Per-page: usually “{Page Title} | Infrio India”, or use **`titleExact`** on `<SEO>` when the copy deck gives the **full** `<title>` string (no suffix).
- **Description**: Unique, under ~155 characters, with main keywords (architecture, interior design, turnkey, Indore, India).
- **Canonical**: One canonical URL per page; homepage `https://www.infrioindia.com/`, others e.g. `https://www.infrioindia.com/about-us`.
- **Keywords**: Set in `index.html` and optionally per page via `<SEO keywords="..." />`.
- **Author**: “Infrio India” in `index.html`.

All of the above are overridable per route using the `<SEO>` component (see Section 5).

---

## 3. Schema markup (structured data)

- **File**: `public/index.html`, inside `<script type="application/ld+json">`.
- **Types**: **Organization** (`#organization`) and **LocalBusiness** (`#localbusiness`) with `parentOrganization` pointing to the Organization.
- **Fields**: name, url, logo, description, email, telephone, address (PostalAddress), openingHoursSpecification, areaServed, priceRange.
- **Logo**: Uses `https://www.infrioindia.com/favicon.png`. For a dedicated logo image, add e.g. `public/logo.png` and change the URL in the schema and in `SEO.jsx` if needed.

Validate with [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/).

---

## 4. Open Graph and Twitter Card

- **Default**: In `public/index.html` (og:type, og:url, og:title, og:description, og:image, og:image:alt, og:site_name, og:locale; twitter:card, title, description, image, image:alt).
- **Per page**: `<SEO>` in `src/components/Common/SEO.jsx` sets the same tags via react-helmet-async.
- **Image**: Default `https://www.infrioindia.com/og-image.png`. Add a **1200×630 px** image at `public/og-image.png` for best sharing. If you use another path, set the `image` prop in `<SEO>` or update `DEFAULT_OG_IMAGE` in `SEO.jsx`.

---

## 5. Using the SEO component on a new page

```jsx
import SEO from '../Common/SEO';

// Inside your component's return:
<>
  <SEO
    title="Your Page Title"
    titleExact={false}  // true = use `title` as full document title (no " | Infrio India")
    description="Unique description under ~155 chars with main keywords."
    canonicalPath="/your-path"
    image="https://www.infrioindia.com/og-image.png"  // optional
    keywords="optional, comma, keywords"
    noindex={false}   // set true for login, register, account pages
  />
  <Header2 />
  {/* rest of page */}
</>
```

Pages using `<SEO>` (aligned with Infrio MetaTags copy deck): Home2, About1, Services1, ContactUs, ServiceDetail, ServiceDetailInte, ServiceDetailT, ProjectGrid5 (`/project-grid-5-columns`), InfrioChoice (`/infrio-choice`), BlogGrid (`/blog`), Login, Register, ForgotPassword, UserAccount, PartnerAccount (account/auth pages use `noindex` where appropriate).

---

## 6. Sitemap and robots.txt

- **Sitemap**: `public/sitemap.xml`. Contains main marketing and content URLs with `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`. Update `lastmod` when you change pages; add new routes as you add them.
- **robots.txt**: `public/robots.txt`. Allows all crawlers; disallows `/admin/`, `/login/`, `/wp-admin/`, `/cgi-bin/`; allows CSS/JS/image extensions for rendering; points to `Sitemap: https://www.infrioindia.com/sitemap.xml`.

Ensure the live site serves:
- `https://www.infrioindia.com/sitemap.xml`
- `https://www.infrioindia.com/robots.txt`

Submit the sitemap in [Google Search Console](https://search.google.com/search-console) (Sitemaps section).

---

## 7. Google Search Console compatibility

- **Canonicals**: Every indexable page has a canonical URL (default in `index.html`, overridden by `<SEO>`).
- **Sitemap**: Submitted in GSC; URLs in sitemap match canonical URLs.
- **robots.txt**: Allows crawling of indexable pages and references the sitemap.
- **Structured data**: Valid JSON-LD in `<head>`; no invalid or conflicting markup.
- **Mobile**: Viewport meta tag is set in `index.html`.

---

## 8. Technical SEO improvements

- **HTTPS**: Enforce HTTPS and use the same canonical host (e.g. always `www.infrioindia.com`).
- **Redirects**: 301 redirect `infrioindia.com` → `https://www.infrioindia.com/` and use that in canonicals and sitemap.
- **404**: Catch-all route (`path='*'`) renders an error page; consider a custom 404 component with helpful links and `noindex` if desired.
- **Internal links**: Use React Router `<NavLink>`/`<Link>` for crawlable links; avoid only-on-click content for important pages.
- **Heading hierarchy**: Use one `<h1>` per page and logical `<h2>`–`<h6>` order.
- **Alt text**: Ensure all meaningful images have descriptive `alt` attributes.
- **Stable OG/schema image**: Prefer a fixed URL (e.g. `/og-image.png`, `/logo.png`) in `public/` instead of hashed build paths.

---

## 9. Page speed and Core Web Vitals

- **LCP (Largest Contentful Paint)**: Optimize hero/slider images (WebP, correct size, lazy load below fold). Preload critical images if needed.
- **INP / FID (interaction)**: Minimize main-thread work; defer or code-split non-critical JS.
- **CLS (Cumulative Layout Shift)**: Set width/height or aspect-ratio on images and embeds; reserve space for ads or dynamic content.
- **General**: Use production build; enable gzip/Brotli on the server; use a CDN for static assets; consider lazy loading for below-fold images and routes (e.g. React.lazy + Suspense).

---

## 10. Optional / missing SEO elements

- **hreflang**: If you add multiple languages, add `<link rel="alternate" hreflang="x" href="...">` (e.g. in `<SEO>` or a layout).
- **BreadcrumbList schema**: Add JSON-LD for breadcrumbs on service and project pages.
- **FAQ schema**: On FAQ page, add FAQPage structured data.
- **Article schema**: On blog/post pages, add Article or NewsArticle with headline, datePublished, dateModified, author.
- **Preconnect**: For critical third-party origins (e.g. fonts, analytics), add `<link rel="preconnect" href="...">` in `index.html`.
- **OG image**: Add `public/og-image.png` (1200×630) and optionally per-page images for key landing pages.

---

## 11. Checklist after deployment

- [ ] Confirm `https://www.infrioindia.com/robots.txt` and `https://www.infrioindia.com/sitemap.xml` are reachable.
- [ ] Submit sitemap in Google Search Console.
- [ ] Verify canonicals and meta tags with “View Page Source” and “Inspect” on a few URLs.
- [ ] Test structured data with Rich Results Test.
- [ ] Test OG/Twitter with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator).
- [ ] Add `og-image.png` (1200×630) to `public/` if not already present.
