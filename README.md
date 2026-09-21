# Brachistochrone Trajectory Calculator

## Project Introduction

Brachistochrone Trajectory Calculator is a browser-based tool for exploring an idealized flip-and-burn space journey. The spacecraft starts at rest, accelerates with constant proper acceleration for half of the route, flips at the midpoint, and applies the same acceleration in the opposite direction until it arrives at rest. The project is designed for science-fiction writers, tabletop and video-game players, physics students, educators, and space-travel enthusiasts who need a fast and transparent way to turn a distance and acceleration into a usable journey timeline.

The application is a fully static website. It runs directly in a modern browser, requires no account, does not send calculation inputs to a backend, and is ready for GitHub Pages deployment. The responsive layout presents the calculator before the explanatory content so a visitor can complete the main task immediately on either a desktop or mobile device.

## What It Does

The calculator accepts either a planet-route preset or a custom straight-line distance. Planet presets use the absolute difference between the selected planets’ average orbital radii and clearly label that distance model in the result. Custom mode supports practical space-distance units, making the tool useful for routes inside a solar system as well as fictional interstellar journeys.

For each calculation, the page displays total observer time, elapsed ship time, midpoint flip time, flip distance, peak velocity, peak velocity as a percentage of the speed of light, and the size of the relativistic correction compared with the Newtonian approximation. Two generated SVG charts show distance and velocity across the observer timeline. The result can be copied as a formatted journey summary, and the current inputs are encoded in the URL so the same configuration can be shared or bookmarked.

## How To Use

1. Open `index.html` through a web server or visit the deployed GitHub Pages URL.
2. Choose **Planet route** to select an origin and destination, or choose **Custom distance** to enter a specific route length.
3. Enter the proper acceleration experienced by the spacecraft. Values can be expressed in standard gravity units or meters per second squared.
4. Use the acceleration preset buttons for common values such as `0.1g`, one-third gravity, `1g`, or `3g`.
5. Select **Calculate trajectory**. The main result and both charts update immediately.
6. Review observer time, ship time, midpoint timing, peak velocity, distance model, and relativistic correction.
7. Select **Copy result** to copy a reusable text summary, or **Copy share link** to copy a URL containing the current settings.

The controls also recalculate when a route, unit, or preset changes. Invalid values are reported beside the form without disruptive browser alert dialogs.

## Supported Formats

The project accepts the following distance units:

- kilometers (`km`)
- million kilometers
- astronomical units (`au`)
- light-seconds
- light-minutes
- light-hours
- light-years

Acceleration can be entered in:

- standard gravity (`g`), using `9.80665 m/s²`
- meters per second squared (`m/s²`)

Planet-route presets include Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. These presets are a convenient distance estimate based on average orbital radii. Users who have another route distance can switch to custom mode and enter it directly.

The calculator output is displayed in adaptive human-readable units. Long durations are expressed in years and days, shorter durations use days, hours, minutes, and seconds, and velocities are formatted as meters per second or kilometers per second. The trajectory charts use inline SVG, so they remain sharp at different screen sizes without image downloads or external chart services.

## Technical Details

The project uses semantic HTML5, responsive CSS, and native ECMAScript modules. It has no runtime framework and no production dependency installation step. `js/calculator.js` contains pure conversion, trajectory, sampling, and formatting functions. `js/presets.js` contains the planet data and route-distance helper. `js/app.js` handles DOM updates, form events, URL state, clipboard actions, chart rendering, and service-worker registration.

The relativistic calculation models constant proper acceleration. For distance `d`, acceleration `a`, and light speed `c`, the implementation defines `q = ad / (2c²)`. It uses numerically stable expressions for observer time, ship proper time, midpoint velocity, and sampled positions. The implementation also calculates the familiar Newtonian result `2√(d/a)` for comparison. Automated tests verify unit conversion, trajectory symmetry, the low-speed Newtonian limit, endpoint sampling, validation behavior, and display formatting.

The site is a Progressive Web App. `manifest.json` defines the standalone application, theme, and generated maskable icons. `sw.js` precaches the complete runtime shell during installation. Every later same-origin GET request follows a network-first strategy: the browser requests the latest resource, updates the cache when the request succeeds, and uses the cached response if the network request fails. Navigation has an additional cached `index.html` fallback.

SEO support includes a keyword-matched title, meta description, canonical URL, Open Graph metadata, Twitter metadata, structured data, `robots.txt`, and `sitemap.xml`. All official URLs target the repository owner’s GitHub Pages path

## Project Structure

```text
brachistochrone-trajectory-calculator/
├── assets/
│   ├── apple-touch-icon.png
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon.svg
├── css/
│   └── styles.css
├── docs/superpowers/
│   ├── plans/
│   └── specs/
├── js/
│   ├── app.js
│   ├── calculator.js
│   └── presets.js
├── scripts/
│   └── validate-project.mjs
├── tests/
│   └── calculator.test.js
├── index.html
├── LICENSE
├── manifest.json
├── package.json
├── README.md
├── repo.config.json
├── robots.txt
├── sitemap.xml
└── sw.js
```

## Deployment

No build command is required. Push the project files to the `main` branch of the `brachistochrone-trajectory-calculator` repository, open the repository settings, select **Pages**, and publish from the root of the `main` branch. The expected public address is:

```text
https://yeshan-jun.github.io/brachistochrone-trajectory-calculator/
```

A local preview must use HTTP rather than opening the HTML file directly because service workers require a secure context or localhost. One simple preview command is:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. Run `npm test` to execute the Node-based calculation tests and `npm run validate` to check project files, metadata, cache coverage, icons, and README structure before deployment.

## Repository

The intended GitHub repository is:

```text
https://github.com/yeshan-jun/brachistochrone-trajectory-calculator
```

Repository automation metadata is stored in `repo.config.json`. It specifies the public visibility, GitHub Pages homepage, `main` default branch, relevant project topics, and the plain HTML/CSS/JavaScript source and Pages stack. The header’s GitHub button points to this repository with `rel="nofollow"` as requested.

## Privacy

All journey inputs and calculations are processed in the browser. The application does not include analytics code, account creation, cloud storage, advertising scripts, or a calculation API. Sharing is explicit: selecting **Copy share link** places the current input values in the page URL, and the user decides where that URL is sent. The service worker stores static application files in the browser cache to support fast repeat visits and offline fallback. Clearing browser site data removes that cached copy.

## License

> This project is released under the MIT License.

The complete license text is available in the `LICENSE` file. The license permits use, copying, modification, distribution, sublicensing, and commercial use while retaining the copyright and permission notice.

## reference

The implementation uses the exact defined values `299,792,458 m/s` for the speed of light, `9.80665 m/s²` for standard gravity, and `149,597,870,700 m` for the astronomical unit. The underlying physics is the constant proper acceleration, symmetric accelerate-flip-decelerate model. Planet values are stored as average orbital radii and are used only to create the clearly labeled orbital-radius-difference preset. For real mission design, orbital mechanics, moving targets, gravity fields, propulsion limits, and fuel requirements form separate calculations outside this focused tool.
