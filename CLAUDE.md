# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start development server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config with Next.js core-web-vitals + TypeScript rules)

There are no tests.

## Architecture

Next.js 16 app using the App Router with TypeScript, React 19, and Tailwind CSS v4. This is a **demo/landing page** for the Crawbat chat widget product.

- **Routing**: `src/app/page.tsx` redirects to `/chat-widget`; all demo content lives in `src/app/chat-widget/page.tsx` (client component). `not-found.tsx` also redirects to `/chat-widget`.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` plugin; global CSS theme variables in `src/app/globals.css`. The app uses a dark zinc palette throughout — `bg-zinc-950` base, `bg-zinc-900` cards.
- **Path alias**: `@/*` maps to `./src/*`
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`

## Routes

| Route | Purpose |
|---|---|
| `/chat-widget` | Public demo/landing page |
| `/test-widget` | Internal widget test harness (password protected) |
| `/test-widget/login` | Login form for the test harness |
| `/api/test-auth` | POST endpoint that validates `TEST_PAGE_PASSWORD` and sets `test_widget_auth` cookie |

## Widget Integration

The shared widget injection pattern is used in both `src/app/chat-widget/page.tsx` and `src/app/test-widget/page.tsx`:

- **Script attributes**: Widget is configured entirely via `data-*` attributes on the injected `<script>` tag (`data-client-id`, `data-widget-key`, `data-api-url`, `data-widget-config-url`, `data-position`, `data-show-badge`, `data-request-timeout`, `data-skip-consent`)
- **Widget lifecycle**: `injectWidget()` / `destroyWidget()` manage script injection and cleanup. `destroyWidget()` removes body-tracked nodes, clears the container, removes the script element, and deletes `window.CrawbatWidget`, `window.crawbatWidget`, and `window.__crawbat`
- **Body tracking**: A `MutationObserver` (`startBodyTracking()`) records nodes added to `document.body` during widget load so they can be cleaned up on destroy (used for floating/mobile mode)
- **Desktop vs mobile**: Desktop (≥640px, `SM_BREAKPOINT`) embeds the widget inline with `data-position="center"` into a container div that has `data-chat-widget-root`; mobile uses `data-position="right"` floating mode appended to `document.body`
- **Widget global API**: After load, the widget exposes `window.CrawbatWidget` with methods `open()` and `setInput(text)`
- **Widget events**: The widget fires `crawbat:open` (widget opened) and `crawbat:consent` (consent accepted) on `window`
- **`sendToWidget()`**: Programmatically opens the widget and populates its input. Prefers `CrawbatWidget.setInput()` if available; falls back to finding the last `<textarea>` in the widget root and triggering a React-compatible synthetic input event

## Chat Widget Demo Page (`/chat-widget`)

- **`CLIENTS` array**: Defines three demo scenarios (`beta`=Healthcare, `alpha`=E-commerce, `gamma`=Local Services) each with `slug`, `widgetKey`, `color`, `icon`, `suggestions`, and optional `badge`/`highlightedSuggestion`
- **Consent persistence**: `crawbat_demo_consent` key in `sessionStorage`; if set, `data-skip-consent="true"` is added to the script so the dialog is skipped
- **Mobile nudge**: On mobile, shown after 7s delay via `setTimeout`; dismissed permanently for the session (via `sessionStorage`) when the widget is opened or the nudge is clicked. Listens for `crawbat:open` event to auto-dismiss.
- **API URLs**: Configurable via `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CONFIG_URL` env vars; default to `https://api.crawbat.com`

## Test Widget Page (`/test-widget`)

Password-protected internal harness for testing arbitrary widget configurations:

- **Auth**: `src/middleware.ts` matches `/test-widget`, checks `test_widget_auth` cookie against `TEST_PAGE_PASSWORD` env var, redirects to `/test-widget/login` if missing. The API route `POST /api/test-auth` validates the password and sets the cookie (7-day expiry, httpOnly).
- **Config options**: Select from `PRESETS` array or enter a custom slug + widget key. Supports three position modes: `center` (inline), `left` (floating), `right` (floating).
- **Mount/Unmount**: Explicit buttons control widget lifecycle rather than automatic re-mounting on state change.

## Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `chat-widget/page.tsx` | Override chat API endpoint |
| `NEXT_PUBLIC_CONFIG_URL` | `chat-widget/page.tsx` | Override widget config endpoint |
| `TEST_PAGE_PASSWORD` | `middleware.ts`, `api/test-auth/route.ts` | Password for `/test-widget` access |
