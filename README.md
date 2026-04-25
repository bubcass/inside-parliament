# Field Notes: SvelteKit Longform Prototype

A newsroom-quality proof of concept for static longform media stories. It uses SvelteKit, TypeScript, a typed block content model, local placeholder assets and a GitHub Pages deployment workflow.

## Features

- Static SvelteKit build with `@sveltejs/adapter-static`
- Story index at `/stories/`
- Story detail routes at `/stories/[slug]/`
- Typed story model with `text`, `image`, `video`, `quote` and `scrolly` blocks
- Sticky scrollytelling media panel driven by `IntersectionObserver`
- Mobile scrolly fallback that keeps the sequence readable without relying on sticky behavior
- Editorial typography, spacious pacing, captions and restrained motion
- Accessible defaults: heading structure, alt text, focus styles, captions track and reduced-motion handling

## Setup

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open the local URL printed by Vite.

## Type Check

```bash
npm run check
```

## Static Build

```bash
npm run build
```

The static output is written to `build/`.

## GitHub Pages Deployment

The workflow in `.github/workflows/deploy.yml` builds the static site and deploys the `build/` folder with GitHub Pages actions.

For a project page at:

```text
https://USERNAME.github.io/REPOSITORY_NAME/
```

the workflow sets:

```text
BASE_PATH=/${{ github.event.repository.name }}
```

This makes SvelteKit generate URLs under the repository name. If you deploy to a user or organization site like `https://USERNAME.github.io/`, or to a custom domain at the root, change the workflow build step to use an empty base path:

```yaml
env:
  BASE_PATH: ''
```

Also make sure repository settings use GitHub Actions as the Pages source.

## Where To Edit

- Story content and block order: `src/lib/content/stories.ts`
- Content TypeScript interfaces: `src/lib/content/types.ts`
- Reusable story blocks: `src/lib/components/story/`
- Global visual system: `src/styles.css`
- Site shell and navigation: `src/routes/+layout.svelte`
- Static export and base path logic: `svelte.config.js`
- GitHub Pages workflow: `.github/workflows/deploy.yml`
- Local placeholder media: `static/media/`

## Adding A Story

1. Add a new object to the `stories` array in `src/lib/content/stories.ts`.
2. Give it a unique `slug`.
3. Add local media files under `static/media/`.
4. Reference media with root-relative paths such as `/media/example.png`.

The dynamic route uses SvelteKit `entries()` to prerender every story in the array.
