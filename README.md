# Unit Conversions — Interactive Practice Tool

An accessible, interactive unit conversion practice tool built for **Physics** and **Chemistry** departments. Students build dimensional analysis (factor-label) chains, cancel units step by step, and receive immediate scaffolded feedback — no login, no build tools, no external dependencies.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Accessibility](#accessibility)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
- [Problem Levels](#problem-levels)
- [Adding or Editing Problems](#adding-or-editing-problems)
- [Deployment](#deployment)
- [Browser Support](#browser-support)

---

## Overview

This tool replaces static worksheet-style pages with a fully interactive learning experience centred on the **factor-label (dimensional analysis) method** — the core unit-conversion skill used in physics, chemistry, and most quantitative sciences.

Students:
1. Read the problem and the given quantity.
2. Select conversion factors from a shuffled bank.
3. Watch units cancel visually in the fraction chain.
4. Enter their numerical answer and unit.
5. Receive immediate correct/incorrect feedback with the option for up to three progressive hints.

Instructors can filter by **department** (Physics / Chemistry / Both) and by **level** (One-Step through Squared & Cubed), and students can export a plain-text summary of their session results.

---

## Features

| Feature | Detail |
|---|---|
| **Interactive fraction chain** | Students click conversion-factor tiles to build a chain; units cancel with strikethrough styling as pairs are matched |
| **Factor flip** | Every tile has a ⇅ flip button to invert the fraction, so students practice orientating factors correctly |
| **Live unit-status banner** | Turns green ✓ when remaining units match the target; shows what unit is still present vs. what is needed |
| **Answer validation** | Accepts decimals and scientific notation (`3.2e4` or `3.2×10^4`); configurable per-problem tolerance (default ±1 %); separate feedback for wrong value vs. wrong unit |
| **Progressive hints** | Up to 3 hints per problem, each revealing a little more — never giving away the full answer on hint 1 |
| **Session summary** | Scorecard + per-problem breakdown table after completing a set |
| **Export results** | One-click `.txt` download of the full session for instructor review or student portfolios |
| **Session persistence** | Progress saved to `localStorage`; a non-modal resume banner appears on return visits |
| **Department & level filtering** | Physics-only, Chemistry-only, or combined problem sets across all four levels |
| **No dependencies** | Pure HTML, CSS, and vanilla JavaScript — works on any static host |

---

## Accessibility

This project targets **WCAG 2.1 Level AA** compliance. Key implementations:

| WCAG Criterion | Implementation |
|---|---|
| **1.3.1** Info & Relationships | Semantic HTML5 (`<main>`, `<nav>`, `<section>`, `<fieldset>`, `<table>` with `<caption>` and `scope`) |
| **1.4.3** Contrast (4.5:1) | All text/background pairs verified; `prefers-contrast: more` forces black borders and deepened brand colour |
| **1.4.4** Resize Text | `font-size: 100%` on `<html>` honours browser font-size preferences; no fixed-px body text |
| **1.4.8** Line Length | `max-width: 65ch` on `<p>` elements |
| **1.4.11** Non-text Contrast | Fraction bars, input borders, and focus rings all ≥ 3:1 against adjacent colours |
| **1.4.12** Text Spacing | No fixed-height containers that clip text on increased letter/line spacing |
| **2.1.1** Keyboard | Every interaction — chain building, factor flipping, hint panel, answer entry, navigation — is fully keyboard-operable |
| **2.4.1** Bypass Blocks | Skip-to-main-content link is the first focusable element on every page load |
| **2.4.3** Focus Order | Focus is programmatically managed when new problems load and when the summary appears |
| **2.4.7** Focus Visible | Global `:focus-visible` ring (3 px solid brand colour) on every interactive element |
| **2.5.5** Target Size | All buttons and inputs have a minimum 44 × 44 px touch target |
| **4.1.3** Status Messages | Feedback messages, chain-status banners, and hint text use `aria-live` regions so screen readers announce them without a page reload |
| **Cancelled units** | Cancelled unit spans receive an updated `aria-label` (e.g. *"454 g — cancelled"*) so screen readers convey the cancellation |
| **Dark mode** | Full dark-mode token swap via `prefers-color-scheme: dark` |
| **Reduced motion** | All transitions and animations zeroed via `prefers-reduced-motion: reduce` |
| **Forced colours** | `@media (forced-colors: active)` maps custom colours to system colour keywords |

---

## File Structure

```
unit-conversions/
├── index.html      # Semantic HTML shell — all sections, ARIA regions, skip link
├── styles.css      # Design system — tokens, components, responsive, a11y media queries
├── problems.js     # Problem data — 18 problems across 4 levels, physics & chemistry
└── app.js          # Application engine — state, DOM, chain logic, validation, hints
```

There is no build step. All four files are loaded directly by the browser.

---

## Getting Started

### Run locally

The simplest approach is a local static server (required to avoid browser `file://` CORS restrictions on some browsers):

```bash
# Python 3
python3 -m http.server 8080 --directory /path/to/unit-conversions

# Node.js (npx — no install needed)
npx serve /path/to/unit-conversions
```

Then open `http://localhost:8080` in your browser.

Alternatively, open `index.html` directly in **Firefox** (Firefox permits `file://` local script loading without a server).

### No build required

There is no `package.json`, no bundler, and no transpilation step. The project is intentionally dependency-free so it can be hosted on any school web server, Canvas LMS file hosting, or GitHub Pages without a CI pipeline.

---

## Problem Levels

| Level | Name | Description | Physics | Chemistry |
|---|---|---|---|---|
| 1 | One-Step | Single conversion factor | 3 problems | 3 problems |
| 2 | Multi-Step | Two or more chained factors | 3 problems | 3 problems |
| 3 | Double Units | Compound units (e.g. m/s, g/cm³) | 2 problems | 2 problems |
| 4 | Squared & Cubed | Area and volume units | 3 problems | 3 problems |

**Total: 18 problems.** Problems are shuffled each session for variety.

---

## Adding or Editing Problems

All problem data lives in `problems.js` as plain JavaScript objects in the `PROBLEMS` array. Each object follows this schema:

```js
{
  id:       'p2-07',          // unique string id
  level:    2,                // 1 | 2 | 3 | 4
  dept:     'physics',        // 'physics' | 'chemistry' | 'both'
  context:  'Optional real-world framing sentence.',
  question: 'How many metres are in 3.5 km?',
  given: {
    value: 3.5,
    unit:  'km',
  },
  factors: [
    // All tiles shown in the bank — include distractors
    {
      id:      'f-km-m',
      numVal:  1000,  numUnit: 'm',
      denVal:  1,     denUnit: 'km',
      label:   '1000 metres per kilometre',   // accessible label
    },
    // ... additional factors / distractors
  ],
  solution: ['f-km-m'],        // ordered array of correct factor ids
  answer: {
    value:     3500,
    unit:      'm',
    tolerance: 0.01,           // fractional tolerance — 0.01 = ±1 %
  },
  hints: [
    'Hint 1 — minimal nudge.',
    'Hint 2 — more specific.',
    'Hint 3 — near-full worked example.',
  ],
}
```

**Tips for good problems:**
- Include at least one **distractor** factor in the bank so students must think, not just click everything.
- Write hints progressively — hint 1 should not give the answer away.
- Set `tolerance` to `0.02` (±2 %) for problems involving non-exact conversion factors like `1 lb = 454 g`.
- Use `dept: 'both'` for problems relevant to either department.

---

## Deployment

### GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch, root folder.
3. The site will be live at `https://<your-org>.github.io/unit-conversions/`.

### Canvas LMS

Upload all four files to a Canvas Files folder set to **public**, then embed the `index.html` URL in a page using an iframe or redirect link.

### School web server

Copy the four files into any directory served by Apache, Nginx, or IIS. No server-side configuration is required.

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge 100+ | ✓ Full |
| Firefox 100+ | ✓ Full |
| Safari 15.4+ | ✓ Full |
| iOS Safari 15.4+ | ✓ Full |
| Samsung Internet 19+ | ✓ Full |

The tool uses no experimental APIs. `localStorage`, `CSS custom properties`, `aria-live`, and `Blob`/`URL.createObjectURL` (for export) are all broadly supported.
