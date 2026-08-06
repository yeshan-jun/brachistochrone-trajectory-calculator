# Brachistochrone Trajectory Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver a tested, responsive, PWA-enabled static calculator and a validated versioned ZIP ready for GitHub Pages.

**Architecture:** Use plain HTML/CSS/JavaScript modules. Keep physics calculations independent from DOM code, render charts with native SVG, and use a network-first service worker with a complete precache list.

**Tech Stack:** HTML5, CSS3, ECMAScript modules, SVG, Web App Manifest, Service Worker, Node.js built-in test runner.

## Global Constraints

- No backend, login, registration, framework, or build step.
- Canonical and homepage are `https://yeshan-jun.github.io/brachistochrone-trajectory-calculator/`.
- GitHub button links to `https://github.com/yeshan-jun/brachistochrone-trajectory-calculator` with `rel="nofollow"`.
- Add exactly nine `VARIABLE` comments immediately above `</head>`.
- Footer contains copyright text only.
- README contains at least 600 English words and every requested section.
- PWA fetch strategy is network first, cache fallback.
- ZIP excludes `.git`, temporary files, and test output.

---

### Task 1: Calculation engine

**Files:**
- Create: `tests/calculator.test.js`
- Create: `js/calculator.js`
- Create: `js/presets.js`
- Create: `package.json`

**Interfaces:**
- Produces: `convertDistanceToMeters`, `convertAccelerationToMps2`, `calculateTrajectory`, `sampleTrajectory`, `formatDuration`, `formatVelocity`, and `PLANETS`.

- [x] Write tests for unit conversion, valid trajectory values, relativistic bounds, symmetry, endpoints, and invalid inputs.
- [x] Run `npm test` and confirm failure because implementation modules are absent.
- [x] Implement pure functions and route preset data.
- [x] Run `npm test` and confirm all tests pass.

### Task 2: Responsive calculator interface

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`

**Interfaces:**
- Consumes calculation functions and preset data from Task 1.
- Produces an accessible calculator, shareable URL state, clipboard actions, inline validation, and native SVG charts.

- [x] Build semantic HTML with SEO metadata, canonical, structured data, GitHub button, calculator, supporting content, and copyright-only footer.
- [x] Build desktop/mobile layouts, controls, results, charts, focus styles, and reduced-motion behavior.
- [x] Wire modes, presets, calculation, result rendering, copy/share, URL state, and service-worker registration.
- [x] Test the page through a local HTTP server and inspect desktop and mobile screenshots.

### Task 3: PWA, icons, and crawl files

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `assets/icon.svg`
- Create: `assets/favicon.svg`
- Create: `assets/icon-192.png`
- Create: `assets/icon-512.png`
- Create: `assets/apple-touch-icon.png`
- Create: `robots.txt`
- Create: `sitemap.xml`

**Interfaces:**
- Produces install metadata, offline cache fallback, icons, and search-engine discovery files.

- [x] Generate original trajectory-themed vector and raster icons.
- [x] Add the complete local asset list to service-worker precache.
- [x] Implement network-first fetch with cache fallback and navigation fallback.
- [x] Validate manifest and confirm all cached assets exist.

### Task 4: Documentation and repository configuration

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `repo.config.json`
- Create: `scripts/validate-project.mjs`

**Interfaces:**
- Produces user-facing documentation, MIT terms, exact repository automation metadata, and repeatable project validation.

- [x] Write the requested README sections with more than 600 English words.
- [x] Add MIT license text and exact repository JSON structure.
- [x] Implement checks for JSON parsing, canonical, comments, README length, required files, and cache coverage.
- [x] Run `npm run validate` and fix every reported issue.

### Task 5: Final verification and packaging

**Files:**
- Create: `/mnt/data/brachistochrone-trajectory-calculator.v1.zip`

**Interfaces:**
- Consumes the completed project tree.
- Produces the final downloadable archive.

- [x] Run tests and project validation from a clean state.
- [x] Verify local HTTP responses and service-worker JavaScript syntax.
- [x] Create the ZIP without `.git`, cache folders, logs, or temporary files.
- [x] Test archive integrity, extract it to a temporary directory, and rerun validation against the extracted copy.
