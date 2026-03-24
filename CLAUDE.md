# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start development server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config with Next.js core-web-vitals + TypeScript rules)

## Architecture

Next.js 16 app using the App Router with TypeScript, React 19, and Tailwind CSS v4. This is a **demo/landing page** for the Crawbat chat widget product.

- **Routing**: `src/app/page.tsx` redirects to `/chat-widget`; all demo content lives in `src/app/chat-widget/page.tsx` (client component)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` plugin; global CSS theme variables in `src/app/globals.css`
- **Path alias**: `@/*` maps to `./src/*`
- **Fonts**: Geist font family loaded via `next/font`

## Widget Integration

The chat widget page (`src/app/chat-widget/page.tsx`) dynamically injects a third-party script from `widget.crawbat.com`. Key patterns:

- **Client configs**: The `CLIENTS` array defines demo scenarios (alpha/beta/gamma) with widget keys, colors, icons, and suggestion prompts
- **Widget lifecycle**: `injectWidget()` / `destroyWidget()` manage script injection and cleanup, including a MutationObserver to track DOM nodes added by the widget
- **Responsive behavior**: Desktop (≥640px) embeds the widget inline in a container; mobile uses the default floating position. The widget re-mounts on breakpoint changes
- **Consent persistence**: Uses `sessionStorage` to skip the consent dialog after first acceptance
- **`sendToWidget()`**: Programmatically opens the widget and inserts suggestion text into its input field using React-compatible value setting
