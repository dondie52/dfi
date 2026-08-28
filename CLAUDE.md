# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The public website for Digital Futures Initiative (a programme of Lapologa Foundation). A single-page, framework-free static site (`index.html` + `styles.css` + `script.js` + `config.js`, plus `404.html`, `robots.txt`, `sitemap.xml`), deployed to GitHub Pages via GitHub Actions. There is no build step, package manager, bundler, or test suite — every file is served as-is.

Deployed at `https://dondie52.github.io/dfi/` — a GitHub Pages **project** page, so the site lives under the `/dfi/` subpath. `index.html` uses relative asset paths (which work under the subpath); `404.html` must use `/dfi/`-prefixed absolute paths, because GitHub serves it from arbitrary URL depths.

## Working locally

Open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .`). There is no install/build/lint/test command — changes are visible on a page reload.

## Deployment

`.github/workflows/deploy.yml` deploys the repository root to GitHub Pages on every push to `main` (or manual dispatch). It uploads the whole directory as-is (`actions/upload-pages-artifact` with `path: .`) — there's no build/compile step in CI, so whatever is committed is what ships.

## Architecture

- `index.html` — entire page as one document, sections in scroll order (hero → about → focus → programmes → get involved → about DFI → gallery → connect → footer). Markup is written dense/minified-by-hand (little internal whitespace); match that style rather than reformatting to a more verbose layout.
- `styles.css` — plain CSS, no preprocessor. All colour, spacing, and easing lives in the `:root` token block at the top; add a token there rather than hardcoding a literal further down. Section rhythm is the single `--section-y` clamp, so sections stay in step and need no per-breakpoint padding overrides. Two breakpoints: 1024px (relax the desktop grids) and 760px (collapse to one column).
- `script.js` — small vanilla-JS behavior layer: applies `config.js` values into the DOM (title, social links, footer year), mobile nav (toggle, Escape, outside click), header scroll-state class, nav scrollspy, and scroll reveals. No dependencies, no module system — everything is top-level `querySelector` + event listeners, with `?.` guards throughout.
- `config.js` — the only file meant to hold editable/environment-specific values (`siteTitle`, `mission`, `siteUrl`, social URLs, `contactEmail`). `script.js` should stay generic; anything that changes per-deployment belongs here instead.

### Two things that are easy to get wrong

**Motion must stay opt-in.** The `prefers-reduced-motion` block at the end of `styles.css` kills all animation with `!important`. So `script.js` adds the `reveal`/`hero-step` classes (which set `opacity: 0`) *only* after checking `matchMedia('(prefers-reduced-motion: reduce)').matches` is false. Content is visible by default and stays visible with JS disabled. Never put `opacity: 0` on a revealed element in the markup — reduced-motion visitors would see a blank page.

**The `<head>` URLs cannot come from `config.js`.** Canonical, `og:*`, and `twitter:*` tags need absolute URLs, and social scrapers do not run JavaScript, so those are hardcoded in `index.html`. `config.siteUrl`, the `index.html` meta tags, `robots.txt`, and `sitemap.xml` all carry the same origin and must be changed together — notably if a custom domain is ever added.

### Brand

`--brand-gradient` (`#1a5fb4` → `#4caf50`) is taken from the logo in `assets/images/dfi-logo-full.png`, whose tagline "Learn. Create. Innovate. Connect." is the source of the four `.focus-list` items. The gradient is used only for rules and hover bars — never behind text, because white on its green end fails WCAG AA. Text CTAs use solid `--accent` with `--ink` text (~12:1).

Icons are inline SVG (`.focus-symbol`, `.social-icon`), not Unicode glyphs — the previous `⌁ ✦ ↗ ∞` characters rendered as tofu on some Android and Windows font stacks. Keep new icons as drawn SVG at a consistent 1.5 stroke weight.
- `assets/images/` — logo and illustrative images referenced by relative path from `index.html`.

## Content rules (from README.md / PRODUCT.md)

- There is no contact form. Visitors are routed to Facebook/TikTok DMs (`.involve-cards` and the social links in `#connect`) instead, because there's no verified contact email or submission endpoint yet. Don't add a form back without a real, verified endpoint — route through the social links until then.
- Do not add impact figures, addresses, event information, testimonials, named individuals, or other factual claims unless they've been explicitly verified/supplied — this site intentionally stays high-level until real content exists. The five cards in `#programmes` are an exception the site owner explicitly supplied as an illustrative "coming soon" list, not a verified track record — keep them labeled `.programme-badge` "Coming soon" and don't imply any have launched until told otherwise.
- Images under `assets/images/` that are AI-generated illustrations are explicitly labeled as such in their `alt` text and adjacent captions (see the `.image-note` and `<figcaption>` elements in `index.html`). Preserve that labeling if you touch those sections; don't present illustrative images as real photos.
