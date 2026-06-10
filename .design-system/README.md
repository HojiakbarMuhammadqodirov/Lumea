# Learnova Design System

## Overview

**Learnova** (branded **Lumea** in the UI) is an interactive EdTech platform based in Uzbekistan that helps students prepare for **SAT**, **IELTS**, **AP** exams and **college admissions**. It targets Uzbek students aiming for top universities abroad (Harvard, MIT, Yale, Princeton, Duke, etc.).

The product is built with React + Vite on the frontend and a Node.js server backend. Styling is a hybrid of hand-crafted CSS (`styles.css`) and Tailwind utility classes in JSX components.

**Current known brand name inconsistency:** The codebase uses both "Learnova" (package name, folder name) and "Lumea" (displayed in the UI). This design system documents both; Lumea appears to be the current public-facing brand.

---

## Sources

- **Codebase:** `Learnova/` (mounted via File System Access API)
  - Frontend: `Learnova/client/src/`
  - Main CSS: `Learnova/client/src/styles.css`
  - Dashboard tokens: `Learnova/client/src/dashboard/tokens.js`
  - Components: `Learnova/client/src/components/`
  - Dashboard: `Learnova/client/src/dashboard/`
  - i18n: `Learnova/client/src/i18n/translations.js` (English + Uzbek)
- **Images:** `Learnova/client/public/images/` → copied to `assets/images/`

---

## Products / Surfaces

1. **Public Website (Landing + Marketing pages)** — Landing page, SAT page, IELTS page, Pricing page, FAQ page. Uses custom CSS classes (`landingNavbar`, `publicContainer`, etc.) with a light blue-white palette.
2. **Student Dashboard** — Authenticated student area with sidebar navigation. Covers Home, Lessons, Tests, Stats, Rating, Profile. Uses Tailwind + token system (`tokens.js`).
3. **Admin/Teacher Panel** — Separate authenticated view for admins and teachers managing students, courses, and lessons.
4. **Practice Test Viewer** — In-browser SAT/IELTS test runner (`PracticeTest.jsx`, `LessonViewer.jsx`).

---

## CONTENT FUNDAMENTALS

### Tone & Voice
- **Professional yet approachable.** The brand speaks like a knowledgeable mentor, not a corporation.
- **Aspirational and motivating.** Copy focuses on transformation ("Improve your next score unimaginably", "For minds that aim beyond the crowd").
- **Concise.** Headlines are short and punchy. Body copy is 1–2 sentences max per block.
- **No emoji in UI text** (emoji only used in the dashboard sidebar nav icons — a current weakness the design notes as needing improvement).
- **No exclamation marks** in English headlines. Uzbek UI uses "🚀" sparingly in toast messages.

### Casing
- **Headlines:** Title Case for main headings, sentence case for subtitles/body.
- **Labels & tags:** ALL CAPS with letter-spacing (e.g. "TARGET PERFORMANCE", "SAT MATH").
- **Nav items:** Mixed — English nav uses title case, Uzbek nav uses sentence case.

### Language
- Bilingual: **English** (public marketing) and **Uzbek** (dashboard, some UI).
- "I" vs "you": Second-person ("your score", "your path", "you").
- Brand voice examples:
  - "Everything you need to secure the next chapter of your life."
  - "For minds that aim beyond the crowd."
  - "Put your score report to work."
  - "Structured prep, AI-powered guidance, real materials."
  - "24/7 reading to answer you on chat."

### Numbers & Pricing
- Prices in **UZS** (Uzbek Som), formatted with locale separators (e.g. `79,990 UZS`).
- Scores displayed large and bold for emotional impact.

---

## VISUAL FOUNDATIONS

### Colors

**Primary Palette (Public/Marketing):**
- `--ink: #08355f` — Primary dark blue (deep navy)
- `#173B64` — Brand navy (most common text + icon color)
- `#F6FAFF` — Near-white background (public pages)
- `--bg-1: #dff0ff` — Light blue tint
- `--bg-2: #8bc2ff` — Mid blue
- `--bg-3: #0d4f9c` — Deep blue
- `#ffde70` — Accent yellow (used in accent mark SVG, highlight text)
- `#7c858d` — Muted gray (secondary text, nav links)
- `#5c6670` — Slightly darker muted text

**Dashboard Token Palette:**
- `bg: #F0F5FC` — Dashboard background (slightly cooler than landing)
- `card: #FFFFFF` — White cards
- `border: #DDE6F0` — Subtle blue-gray borders
- `muted: #6B7E96` — Muted text
- `hint: #9EB3C8` — Hint / placeholder text
- `text: #173B64` — Primary text
- `blueAccent: #2563EB` — Interactive blue
- `green: #0F9E6A` — Success/IELTS accent
- `purple: #6D28D9` — AP/advanced accent
- `amber: #D97706` — Warning/milestone
- `red: #DC2626` — Error/danger
- `danger: #bf2c55` — Danger (public CSS)

### Typography
- **Primary font:** `"Soleil"` (custom/proprietary) with fallbacks `"Poppins"`, `"Segoe UI"`, Tahoma, Geneva, Verdana, sans-serif
- **Landing/Marketing font:** `"Trebuchet MS"`, `"Segoe UI"`, Arial, sans-serif
- **No monospace** used in the UI (math expressions are rendered as text, not code)
- **Weight scale:** 700 (bold), 800 (extrabold), 900 (black), 1000 (ultra-black for score numbers)
- **Font size scale:** 0.46rem (tiny label) → 0.82rem → 0.92rem → 1rem → 1.08rem → 1.12rem → clamp(2rem, 4.4vw, 3.6rem) (hero headlines)

> ⚠️ **Font substitution:** "Soleil" is a commercial font not available on Google Fonts. Nearest match used: **"DM Sans"** (clean geometric sans, similar weight range). "Trebuchet MS" for marketing is a system font — substituted with **"Plus Jakarta Sans"** for closer feel.

### Backgrounds
- **Public pages:** Multi-layer radial gradient on `body`, fixed attachment. Light blue → white → deeper blue. Not full-bleed images. Clean and airy.
- **Landing page container:** `linear-gradient(180deg, #F6FAFF 0%, #F6FAFF 62%, #eaf2f8 100%)`
- **Dashboard:** Flat `#F0F5FC` background — no gradients.
- **No textures, no patterns, no illustrations.** Clean geometric.
- **Floating background elements:** University logo PNGs float at low opacity (0.5) as decorative background on the landing hero.

### Spacing
- **Base unit:** 4px (Tailwind-style: 0.5 = 2px, 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px, 6 = 24px)
- **Container max-width:** 1180px, `min(1180px, calc(100% - 32px))`
- **Section padding:** Large vertical rhythm — `padding: 150px 0 160px`, `padding: 260px 0 140px` between major landing sections
- **Cards:** `rounded-2xl` (16px) for main cards, `rounded-xl` (12px) for sub-elements, `rounded-full` for pills/badges/buttons

### Cards
- **White cards:** `bg-white border border-[#DDE6F0] rounded-2xl` — subtle border, no shadow in dashboard
- **Light cards:** `bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl`
- **Public result cards:** `background: rgba(246, 250, 255, 0.9); border: 1px solid rgba(23, 59, 100, 0.08); box-shadow: 0 18px 40px rgba(23, 59, 100, 0.08); border-radius: 8px`
- No heavy drop shadows in dashboard. Subtle `box-shadow: 0 18px 50px rgba(7, 49, 94, 0.18)` for public page modals.

### Borders & Radii
- **Pill/badge/button:** `border-radius: 999px`
- **Main cards (dashboard):** `border-radius: 16px` (rounded-2xl)
- **Sub-cards/inputs:** `border-radius: 12px` (rounded-xl)
- **Public result cards:** `border-radius: 8px`
- **Border color:** `rgba(23, 59, 100, 0.08–0.1)` on public; `#DDE6F0` on dashboard

### Animations & Motion
- **Library:** AOS (Animate on Scroll) — `duration: 650ms, easing: ease-out-cubic`
- **Nav transition:** `cubic-bezier(0.22, 1, 0.36, 1)` — a smooth deceleration curve used broadly
- **Hover transitions:** 180–220ms ease
- **Active/press states:** `transform: scale(0.94–0.95)` — slight shrink
- **Book carousel:** 760ms `cubic-bezier(0.22, 1, 0.36, 1)` with 3D `rotateY`
- **Number counters:** Animated count-up on scroll visibility
- **Dashboard progress bars:** `transition: width 1s cubic-bezier(.4,0,.2,1)`
- **No bounce, no spring animations.** All easing is smooth deceleration.
- **Scroll-triggered:** Most landing animations trigger on scroll via IntersectionObserver + AOS.

### Hover States
- **Buttons (primary):** Lift + shadow (`translateY(-1px)`, `box-shadow: 0 10px 20px rgba(23,59,100,0.18)`)
- **Nav links:** Color change + underline slide-in animation
- **Dashboard nav items:** `bg-[#F0F5FC]` background fill
- **Active nav item:** `bg-[#173B64] text-white`
- **Cards (public):** No hover state on most cards
- **Cards (dashboard with onClick):** Border color darkens `hover:border-[#b5c8e0]`

### Imagery
- **University logos:** Harvard, MIT, Yale, Princeton, Duke — used as floating decorative elements
- **Book covers:** Real book cover photos (ebrwpanda.png, ielts.png, mathpanda.png, satguide.png)
- **Chat screenshots:** Used in "Teachers" section of landing
- **No generated/illustrated imagery.** All imagery is photographic or logo-based.
- **Image color:** Full color, natural — no filters beyond `saturate(0.92)` for non-active states.

### Transparency & Blur
- **Glass effect:** Used for nav only (`--glass: rgba(255,255,255,0.22)`, `--glass-strong: rgba(255,255,255,0.32)`) but the scrolled navbar uses `rgba(246, 250, 255, 0.96)` — near-opaque, no actual blur effect enabled (backdrop-filter: none in scrolled state).
- **No heavy frosted glass.** Clean and solid preferred.

### The Accent Mark
A distinctive shield-shaped SVG (`LumeaAccentMark`) with a yellow fill (`#ffde70`) and navy stroke appears before section labels throughout the landing page. Three variants: `growth` (chart), `chat` (speech bubble), `tick` (checkmark). This is a key brand motif.

---

## ICONOGRAPHY

- **Primary icon approach:** Emoji used in dashboard sidebar navigation (🏠📚✏️📊⭐👤) — this is a current weakness; no icon library is linked.
- **Custom SVG icons:** The `LumeaAccentMark` component draws a custom shield SVG. Arrow icons (←→) and math symbols (∑) are used inline as Unicode.
- **No icon library** (no Lucide, Heroicons, FontAwesome, etc.) is currently in use.
- **Recommended:** Lucide Icons (stroke-based, clean weight matches the brand's aesthetic).
- **No sprite sheets or icon fonts.** Pure emoji + inline SVG + Unicode.
- The sun/moon theme toggle uses hand-rolled SVG paths.

---

---

## File Index / Manifest

### Root
| File | Purpose |
|------|---------|
| `README.md` | This file — full brand + design documentation |
| `SKILL.md` | Agent skill definition for Claude Code |
| `colors_and_type.css` | All CSS custom properties: colors, type, spacing, shadows, animation tokens |

### Assets (`assets/`)
| File | Purpose |
|------|---------|
| `assets/images/harvard.png` … `duke.png` | University logo PNGs — used as floating decorative bg elements |
| `assets/images/books/*.png` | Study book cover photos — used in landing carousel |
| `assets/images/screenshots/chat.png`, `chat2.png` | Teacher chat screenshots — used in Teachers section |

### Preview Cards (`preview/`)
These are the Design System tab cards — small HTML specimens.

| File | Group | Description |
|------|-------|-------------|
| `colors-brand.html` | Colors | Navy scale, dark blue, yellow accent range |
| `colors-semantic.html` | Colors | Status + neutral colors |
| `colors-tags.html` | Colors | Tag pill variants + tint chips |
| `type-scale.html` | Type | Full typographic hierarchy |
| `type-display.html` | Type | Score display numerals + weight scale |
| `spacing-tokens.html` | Spacing | Spacing scale + border radii |
| `spacing-shadows.html` | Spacing | Shadow system + animation curves |
| `comp-buttons.html` | Components | Button variants |
| `comp-cards.html` | Components | Card variants |
| `comp-badges.html` | Components | Tags, badges, atoms |
| `comp-navbar.html` | Components | Landing navbar states |
| `comp-footer.html` | Components | Public footer |
| `comp-nav-sidebar.html` | Components | Dashboard sidebar + topbar |
| `comp-interactive.html` | Components | Question options, countdown, toasts |
| `brand-logo.html` | Brand | Lumea wordmark variants |
| `brand-accent-mark.html` | Brand | Shield accent SVG mark |
| `brand-assets.html` | Brand | Photo + image assets |

### UI Kits

#### `ui_kits/website/` — Public Website
Interactive click-through prototype of the Lumea marketing site.

| File | Purpose |
|------|---------|
| `index.html` | Full landing page prototype (Landing, Pricing views) |
| `Header.jsx` | Animated navbar with scroll-morph to pill shape |
| `LandingHero.jsx` | Hero section with floating university logos + CTA |
| `Footer.jsx` | Public footer with nav + contact |

#### `ui_kits/dashboard/` — Student Dashboard
Interactive click-through prototype of the LearnNova student dashboard.

| File | Purpose |
|------|---------|
| `index.html` | Full dashboard — Home, Lessons, Tests, Stats, Rating, Profile pages |
| `Sidebar.jsx` | Left nav sidebar with active states, badges, user area |
| `Topbar.jsx` | Top bar with streak chip + rating chip |
| `UI.jsx` | All primitive components: Card, Button, Tag, PBar, Avatar, IconBox, ActivityBars, CountdownBoxes, QuestionOption, Toast |

---

## Color Token Updates (May 2026)

Per design review, the Brand Blue palette was refined:
- Removed: Blue Accent (#2563EB) — was redundant with Blue Mid
- Removed: Ink (#08355f) — was duplicate of Navy Deep
- Added: **Dark Blue** (#040E1C) — deepest navy anchor
- Expanded yellow to 3 stops: Light (#FFF3B0), Base (#ffde70), Deep (#F5C400)
