---
name: learnova-design
description: Use this skill to generate well-branded interfaces and assets for Learnova (public brand name: Lumea), an EdTech platform helping students in Uzbekistan prepare for SAT, IELTS, AP, and college admissions. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping both the public marketing website and the student dashboard.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick Reference

**Brand name:** Lumea (public) / Learnova (internal/codebase)
**Products:** Public marketing website + Student dashboard
**Primary color:** #173B64 (navy)
**Accent:** #ffde70 (yellow)
**Fonts:** DM Sans (substitute for Soleil) + Plus Jakarta Sans (substitute for Trebuchet MS)
**Border radius:** 999px (pills), 16px (cards), 12px (inputs/sub-cards), 8px (public cards)
**Key motif:** Shield accent mark SVG (yellow fill, navy stroke) — 3 variants: growth, chat, tick

## Key Files
- `colors_and_type.css` — all design tokens
- `ui_kits/website/index.html` — public site prototype
- `ui_kits/dashboard/index.html` — student dashboard prototype
- `ui_kits/dashboard/UI.jsx` — all reusable dashboard primitives
- `assets/images/` — university logos, book covers, screenshots
