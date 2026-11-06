## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, ai-tools

## Overview

Repository contains two Svelte apps:

- **Root (`./`)**: SvelteKit 3 + Svelte 5 + TypeScript + Tailwind CSS 4. The main "study with me" app lives in `src/routes/` (`+layout.svelte`, `+page.svelte`).
- **`study-with-me/`**: Standalone Vite + Svelte 5 (JavaScript) scaffold with its own `package.json` and `node_modules`. Independent of the root app.

## Commands

Run from the repository root (root SvelteKit app):

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run check` – `svelte-check` type checking (`svelte-kit sync` + `svelte-check`)
- `npm run lint` – Prettier check + ESLint
- `npm run format` – Prettier write

For the standalone app, run inside `study-with-me/`:

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build

No test framework is configured.

## Conventions

- Root app uses TypeScript, Svelte 5 runes mode is forced via `vite.config.ts` (`runes: true`), and Tailwind is wired through `@tailwindcss/vite`.
- Import app-local modules via the `#lib` alias (`#lib/*` → `src/lib/*`); `src/lib/index.ts` is the barrel.
- `study-with-me/` is plain JavaScript and does not use TypeScript, Tailwind, ESLint, or Prettier from the root.
- Follow Prettier (`prettier.config.js`) and ESLint (`eslint.config.js`) formatting. Do not add comments unless necessary.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
