# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start development server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config with Next.js core-web-vitals + TypeScript rules)

## Architecture

Next.js 16 app using the App Router with TypeScript, React 19, and Tailwind CSS v4.

- **App entry**: `src/app/page.tsx` (single page currently)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` plugin; global CSS theme variables in `src/app/globals.css`
- **Path alias**: `@/*` maps to `./src/*`
- **Fonts**: Geist font family loaded via `next/font`
