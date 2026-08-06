# Brachistochrone Trajectory Calculator Design

## Goal

Build a responsive, installable, static GitHub Pages calculator for idealized flip-and-burn space travel. Users enter a custom distance or choose a planet-route preset, set constant proper acceleration, and receive observer time, ship time, midpoint flip time, peak speed, relativistic correction, and trajectory charts.

## Architecture

The project uses plain HTML, CSS, and ECMAScript modules with no runtime dependencies or build step. Pure calculation and formatting functions live in `js/calculator.js`; route presets live in `js/presets.js`; browser interaction, URL state, and SVG chart rendering live in `js/app.js`. Node's built-in test runner exercises the calculation module without a DOM.

## User Interface

The header contains the product identity on the left and a `rel="nofollow"` GitHub repository button on the right. The first viewport uses a two-column desktop layout and a one-column mobile layout. The left panel contains a mode switch, route or custom-distance inputs, acceleration controls, and the primary calculation action. The right panel displays total observer time, ship time, flip time, peak velocity, percent of light speed, and a copy/share action. Two compact SVG charts appear immediately below the primary result area.

Educational explanations, formulas, use cases, model assumptions, and frequently asked questions follow below the calculator so they do not delay the core task.

## Calculation Model

The calculator assumes straight-line travel, zero relative velocity at departure and arrival, constant proper acceleration for the first half, an instantaneous midpoint flip, and equal deceleration for the second half. It computes both relativistic and Newtonian values. Standard constants are fixed at `c = 299792458 m/s`, `g0 = 9.80665 m/s²`, and `1 au = 149597870700 m`.

For total distance `d` and proper acceleration `a`, define `q = ad/(2c²)` and rapidity `eta = acosh(1 + q)`. Total observer time is `2(c/a)sinh(eta)`, total ship proper time is `2(c/a)eta`, and midpoint velocity is `c tanh(eta)`. The Newtonian comparison is `2sqrt(d/a)` with midpoint velocity `sqrt(ad)`.

## Preset Distance Model

Planet presets use the absolute difference between published average orbital radii. The interface explicitly labels this as an orbital-radius-difference estimate. Custom distance remains the default-friendly path and supports kilometers, million kilometers, astronomical units, light-seconds, light-minutes, light-hours, and light-years.

## Error Handling

Inputs are validated inline. Distance and acceleration must be finite and greater than zero; origin and destination must differ in planet mode. No browser alerts are used. Invalid URL parameters are ignored and replaced with safe defaults.

## PWA and Offline Behavior

`manifest.json` defines the standalone app and generated icons. `sw.js` precaches every required local asset. Subsequent requests follow a network-first strategy: fetch from the network, update the cache on success, and fall back to the cached response when the network fails. Navigation requests fall back to cached `index.html`.

## SEO

The page title directly targets “Brachistochrone Trajectory Calculator.” The description emphasizes flip-and-burn travel time, ship time, observer time, midpoint velocity, and charts. Canonical, Open Graph, Twitter, structured data, sitemap, and robots metadata point to `https://yeshan-jun.github.io/brachistochrone-trajectory-calculator/`.

## Testing

Unit tests verify conversions, Newtonian limits, relativistic invariants, symmetry, endpoint sampling, and invalid input behavior. A project validation script verifies required files, canonical URL, nine variable comments, README word count, service-worker asset coverage, and JSON validity.
