# Frontend performance

## Summary

The frontend bundle was reduced through dependency pruning, code splitting,
and image loading optimizations. This document describes what changed and how
to verify bundle size and load performance going forward.

## Dependency pruning

Unused packages were removed from `frontend/package.json`: `recharts`,
`next-themes`, `cmdk`, `embla-carousel-react`, `react-resizable-panels`, and
a set of unused Radix UI components (`react-aspect-ratio`,
`react-collapsible`, `react-context-menu`, `react-hover-card`, `react-menubar`,
`react-navigation-menu`, `react-progress`, `react-radio-group`,
`react-slider`, `react-switch`, `react-tabs`, `react-toggle`,
`react-toggle-group`, `react-tooltip`).

Before removing a dependency, confirm it is unused:

```bash
grep -r "from '<package>'" frontend/src
```

## Code splitting

Routes are lazy-loaded with `React.lazy` and `Suspense`:

```javascript
const VehicleDetailPage = lazy(() => import("@/pages/VehicleDetailPage"));
const QuoteResultPage = lazy(() => import("@/pages/QuoteResultPage"));
```

`HomePage` keeps the above-the-fold sections (hero, vehicle grid) eager and
lazy-loads everything below the fold (destinations, how-it-works, callback
form, testimonials, FAQ, CTA banner) with skeleton fallbacks.

## Image loading

- Set explicit `width`/`height` on images to avoid layout shift
- Add `loading="lazy"` on below-the-fold images
- Add `decoding="async"` so decode does not block rendering
- Request appropriately sized images from the CDN (`?w=...&h=...`)

## Component memoization

`VehicleCard` is wrapped in `React.memo` to avoid re-rendering when parent
state changes but its own props do not.

## Verifying bundle size

```bash
cd frontend
rm -rf node_modules
yarn install
yarn build
ls -lh build/static/js
```

Compare the main bundle and lazy chunk sizes against the previous build. A
regression shows up as the main bundle growing back toward its pre-split
size, or a lazy chunk disappearing (meaning it was pulled back into main).

To inspect what is in the bundle:

```bash
ANALYZE_BUNDLE=true yarn build
```

## Verifying with Lighthouse

```bash
yarn start
```

Open the app in Chrome, open DevTools, run Lighthouse against the page. Track:

| Metric | Target |
|---|---|
| Performance score | 90+ |
| First Contentful Paint | under 1.5s |
| Largest Contentful Paint | under 2.5s |
| Total Blocking Time | under 300ms |
| Cumulative Layout Shift | under 0.1 |

## Manual verification checklist

- Homepage loads and below-the-fold sections lazy-load on scroll
- Navigating to a vehicle detail page loads its own chunk (check the Network
  tab, filtered to JS)
- Submitting a quotation loads the quote result page's own chunk
- No layout shift when images load
- Scrolling and hover animations stay smooth

## Regression testing

Run this after any dependency or routing change:

```bash
cd frontend
yarn build
```

Confirm the build succeeds and the chunk list still includes separate files
for `VehicleDetailPage` and `QuoteResultPage`. If either has merged back into
the main bundle, check for a new top-level import that defeats the
`React.lazy` boundary.

## Monitoring in production

If you want ongoing visibility into real-user performance, add
[web-vitals](https://github.com/GoogleChrome/web-vitals) and report the
metrics to your analytics or logging pipeline:

```javascript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";

onCLS(reportMetric);
onFID(reportMetric);
onFCP(reportMetric);
onLCP(reportMetric);
onTTFB(reportMetric);
```
