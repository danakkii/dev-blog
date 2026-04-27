# Dana Kim — Dev Blog

Personal portfolio and blog built with **Nuxt 4** + **Supabase**.

## Stack

- **Framework**: Nuxt 4 (Vue 3, Composition API)
- **Database / Storage**: Supabase (PostgreSQL + Storage)
- **Markdown**: marked v17
- **Styling**: Scoped CSS (no UI framework)

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm run preview
```

---

## Release Notes

### v0.3.0 — 2026-04-27

#### New Features
- **Blog page (`/blog`)**: Full post list with Naver-style left category sidebar (desktop) and horizontal pill tags (mobile), live search with `<mark>` highlighting across title + content
- **Category field in admin**: Add/edit post category from the editor
- **Markdown TOC**: Right-side sticky table of contents on post detail pages; active heading tracked via IntersectionObserver
- **Reading time**: Auto-calculated — Korean characters (500/min) + English words (200/min), shown on post detail
- **Scroll-to-top button**: Floating button on post detail pages, appears after scrolling 400px, smooth scroll to top
- **Code block copy button**: Injected into every `pre` block; dark-theme compatible, shows "Copied!" feedback for 2s
- **Notion-style URL paste**: Paste a URL in the admin editor → auto-fetches page title server-side → inserts `[title](url)` markdown
- **Server API route (`/api/link-preview`)**: CORS-free title fetching; reads first 15KB, prefers `og:title` over `<title>` tag, 5s timeout

#### Fixes
- **Image upload "bucket not found"**: Auto-attempts to create the `blog-images` Storage bucket on first upload failure; shows setup instructions if creation also fails
- **Link insertion bug**: Fixed raw URL leaking into content after inserting a link with edited text — now tracks `cursorStart`/`cursorEnd` separately
- **Category filter always visible**: Removed `v-if` that hid filters when no categories were assigned yet

#### UX / Layout
- Nav restructured: About/Career/Tech → **Home**; Logs/Guestbook → **Blog**
- Home page: shows latest 3 posts + Guestbook (unchanged)
- Blog page: all posts, no Guestbook, category sidebar always visible
- No horizontal scroll on any viewport — global `overflow-x: hidden` + `box-sizing: border-box`
- One-line English bio on Home

---

### v0.2.0 — prior

- Admin panel: create / edit / delete posts with markdown editor
- Image upload to Supabase Storage
- Link insertion dialog
- Post detail page with rendered markdown
- Guestbook via giscus

### v0.1.0 — initial

- Nuxt 4 project scaffold
- Supabase client integration
- Home page with About / Career / Tech sections
