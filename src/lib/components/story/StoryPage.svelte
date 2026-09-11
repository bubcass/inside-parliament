<script lang="ts">
  import { base } from '$app/paths';
  import { onDestroy, onMount } from 'svelte';
  import type { Story, StoryBlock } from '$lib/content/types';
  import BlockRenderer from './BlockRenderer.svelte';
  import StoryAuthor from './StoryAuthor.svelte';
  import StoryToolbar from './StoryToolbar.svelte';

  let { story }: { story: Story } = $props();
  let heroSrc = $derived(story.hero?.src ?? '');
  let hasHeroMedia = $derived(Boolean(heroSrc.trim()));
  let heroLayout = $derived(hasHeroMedia ? (story.heroLayout ?? 'contained') : 'contained');
  let heroIsVideo = $derived(heroSrc.toLowerCase().endsWith('.mp4'));

  type ContentsEntry = {
    id: string;
    label: string;
    blockIndex: number;
  };

  function headingForBlock(block: StoryBlock) {
    if (block.type === 'text') {
      return (block.headingLevel ?? 2) === 2 ? block.heading : undefined;
    }

    if (block.type === 'media-text') return block.heading;
    return undefined;
  }

  function slugifyHeading(value: string) {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'section';
  }

  let contentsEntries = $derived.by<ContentsEntry[]>(() => {
    if (!story.showContents) return [];

    const counts = new Map<string, number>();
    return story.blocks.flatMap((block, blockIndex) => {
      const heading = headingForBlock(block);
      if (!heading) return [];

      const baseId = slugifyHeading(heading);
      const count = counts.get(baseId) ?? 0;
      counts.set(baseId, count + 1);

      return [{
        id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        label: heading,
        blockIndex
      }];
    });
  });

  let contentsIdMap = $derived.by(() =>
    new Map(contentsEntries.map((entry) => [entry.blockIndex, entry.id]))
  );
  let showContentsRail = $derived(story.showContents && contentsEntries.length > 1);
  let activeContentsId = $state<string | null>(null);
  let teardownContentsObserver: (() => void) | null = null;

  function setupContentsObserver() {
    teardownContentsObserver?.();
    teardownContentsObserver = null;

    if (!showContentsRail || typeof window === 'undefined') {
      activeContentsId = null;
      return;
    }

    const headings = contentsEntries
      .map((entry) => ({ id: entry.id, element: document.getElementById(entry.id) }))
      .filter((entry): entry is { id: string; element: HTMLElement } => Boolean(entry.element));
    if (!headings.length) return;

    activeContentsId = headings[0].id;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top);
          else visible.delete(id);
        }

        if (visible.size) {
          activeContentsId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0]
            ?? activeContentsId;
          return;
        }

        const threshold = window.innerHeight * 0.3;
        let fallbackId = headings[0].id;
        for (const heading of headings) {
          if (heading.element.getBoundingClientRect().top <= threshold) fallbackId = heading.id;
          else break;
        }
        activeContentsId = fallbackId;
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] }
    );

    for (const heading of headings) observer.observe(heading.element);
    teardownContentsObserver = () => {
      observer.disconnect();
      visible.clear();
    };
  }

  onMount(setupContentsObserver);

  $effect(() => {
    showContentsRail;
    contentsEntries;
    if (typeof window === 'undefined') return;
    queueMicrotask(setupContentsObserver);
  });

  onDestroy(() => teardownContentsObserver?.());
</script>

<article class="story">
  <header class={`story-hero ${heroLayout}`}>
    {#if heroLayout === 'immersive'}
      <figure class="hero-media">
        {#if heroIsVideo}
          <video autoplay muted loop playsinline aria-label={story.hero.alt}>
            <source src="{base}{story.hero.src}" type="video/mp4" />
          </video>
        {:else}
          <img src="{base}{story.hero.src}" alt={story.hero.alt} fetchpriority="high" />
        {/if}
        <div class="hero-overlay">
          {#if story.eyebrow}
            <p class="eyebrow">{story.eyebrow}</p>
          {/if}
          <h1>{story.title}</h1>
          <p class="lede overlay-dek">{@html story.dek}</p>
          <div class="meta overlay-meta" aria-label="Story details">
            {#if story.byline}
              <span class="author-meta">
                By {story.byline}
                {#if story.researcher?.role}
                  <span class="author-role"> · {story.researcher.role}</span>
                {/if}
              </span>
            {/if}
            <span>{story.date}</span>
            <span>{story.readingTime}</span>
          </div>
        </div>
      </figure>

      <div class="mobile-immersive-copy">
        <p class="lede">{@html story.dek}</p>
        <div class="meta" aria-label="Story details">
          {#if story.byline}
            <span class="author-meta">
              By {story.byline}
              {#if story.researcher?.role}
                <span class="author-role"> · {story.researcher.role}</span>
              {/if}
            </span>
          {/if}
          <span>{story.date}</span>
          <span>{story.readingTime}</span>
        </div>
      </div>

      {#if story.hero.caption || story.hero.credit}
        <p class="caption immersive-caption">
          {story.hero.caption}
          {#if story.hero.credit}
            <span>{story.hero.credit}</span>
          {/if}
        </p>
      {/if}
    {:else}
      <div class="hero-copy">
        {#if story.eyebrow}
          <p class="eyebrow">{story.eyebrow}</p>
        {/if}
        <h1>{story.title}</h1>
        <p class="lede">{@html story.dek}</p>
        <div class="meta" aria-label="Story details">
          {#if story.byline}
            <span class="author-meta">
              By {story.byline}
              {#if story.researcher?.role}
                <span class="author-role"> · {story.researcher.role}</span>
              {/if}
            </span>
          {/if}
          <span>{story.date}</span>
          <span>{story.readingTime}</span>
        </div>
      </div>

      {#if hasHeroMedia}
        <figure class="hero-media">
          {#if heroIsVideo}
            <video autoplay muted loop playsinline aria-label={story.hero.alt}>
              <source src="{base}{heroSrc}" type="video/mp4" />
            </video>
          {:else}
            <img src="{base}{heroSrc}" alt={story.hero.alt} fetchpriority="high" />
          {/if}
          {#if story.hero.caption || story.hero.credit}
            <figcaption class="caption">
              {story.hero.caption}
              {#if story.hero.credit}
                <span>{story.hero.credit}</span>
              {/if}
            </figcaption>
          {/if}
        </figure>
      {/if}
    {/if}
  </header>

  <StoryToolbar
    {story}
    hasContents={showContentsRail}
    immersive={heroLayout === 'immersive'}
  />
  <StoryAuthor {story} hasContents={showContentsRail} />

  <div class="story-content" class:with-contents={showContentsRail}>
    {#if showContentsRail}
      <aside class="story-contents" aria-label="Table of contents">
        <p class="story-contents-label">Contents</p>
        <nav class="story-contents-nav">
          {#each contentsEntries as entry}
            <a
              class="story-contents-link"
              class:is-active={activeContentsId === entry.id}
              href={`#${entry.id}`}
              aria-current={activeContentsId === entry.id ? 'location' : undefined}
            >{entry.label}</a>
          {/each}
        </nav>
      </aside>
    {/if}

    <div class="story-body">
      {#each story.blocks as block, index}
        <BlockRenderer {block} headingId={contentsIdMap.get(index)} />
      {/each}
    </div>
  </div>
</article>

<style>
  .story {
    overflow: clip;
    /* Article pages begin with the compact secondary rail only. */
    --site-header-height: 2.75rem;
  }

  .story-hero.split {
    align-items: stretch;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin: 0 calc(50% - 50vw);
    max-width: none;
    min-height: max(42rem, calc(100svh - var(--site-header-height)));
    padding: 0;
  }

  .hero-copy {
    max-width: var(--measure-prose);
    width: 100%;
  }

  .story-hero.split .hero-copy {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    justify-self: end;
    padding: clamp(var(--space-7), 7vw, 5rem) clamp(var(--space-6), 5vw, var(--space-8)) clamp(var(--space-7), 7vw, 5rem) var(--gutter);
  }

  .story-hero.contained {
    margin: 0 auto;
    max-width: calc(var(--measure-hero) + (var(--gutter) * 2));
    padding: clamp(var(--space-7), 7vw, 5rem) var(--gutter) var(--space-5);
  }

  .story-hero.contained .hero-copy {
    max-width: var(--measure-hero);
    padding: 0;
  }

  .story-hero.contained h1,
  .story-hero.contained .lede,
  .story-hero.contained .meta {
    max-width: 100%;
  }

  h1 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h1);
    font-weight: var(--font-weight-heading);
    letter-spacing: 0;
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-stack);
    text-wrap: balance;
  }

  .lede {
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
    max-width: var(--measure-card);
    white-space: pre-line;
  }

  .lede :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
  }

  .lede :global(a)::after {
    content: "↗";
    display: inline-block;
    font-size: 0.8em;
    margin-left: 0.14em;
    text-decoration: none;
    transform: translateY(-0.08em);
  }

  .lede :global(em) {
    font-style: italic;
  }

  .lede :global(strong) {
    color: var(--color-accent-2);
    font-weight: 600;
  }

  .meta {
    color: var(--color-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: var(--font-size-small);
    font-weight: 500;
    gap: 0.35rem 0.65rem;
    letter-spacing: 0;
    line-height: var(--line-height-small);
    margin: var(--space-5) 0 0;
    max-width: var(--measure-card);
  }

  .meta span:not(:last-child)::after {
    color: var(--color-faint);
    content: "/";
    margin-left: 0.65rem;
  }

  .author-role {
    color: inherit;
    font-weight: 400;
  }

  @media screen {
    .author-meta {
      display: none;
    }
  }

  .hero-media {
    margin: 0;
    min-width: 0;
  }

  .story-hero.split .hero-media {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    grid-column: 2;
  }

  img,
  video {
    background: var(--color-soft);
    flex: 1;
    height: 100%;
    min-height: 30rem;
    object-fit: cover;
    width: 100%;
  }

  .story-hero.contained .hero-media {
    margin-top: var(--space-6);
  }

  .story-hero.contained img,
  .story-hero.contained video {
    aspect-ratio: 16 / 10;
    display: block;
    flex: none;
    height: auto;
    min-height: 0;
  }

  figcaption {
    margin-left: 0;
    padding-right: var(--gutter);
  }

  figcaption span,
  .immersive-caption span {
    color: var(--color-faint);
    display: block;
    margin-top: 0.2rem;
  }

  .story-hero.immersive {
    margin: 0 calc(50% - 50vw);
    max-width: none;
    padding: 0;
  }

  .story-hero.immersive .hero-media {
    min-height: max(42rem, calc(100svh - var(--site-header-height)));
    position: relative;
  }

  .story-hero.immersive .hero-media::after {
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 0.08) 0%,
      rgb(0 0 0 / 0.04) 45%,
      rgb(0 0 0 / 0.52) 100%
    );
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  .story-hero.immersive img,
  .story-hero.immersive video {
    display: block;
    height: max(42rem, calc(100svh - var(--site-header-height)));
    min-height: 0;
  }

  .hero-overlay {
    bottom: clamp(var(--space-7), 8vh, 5rem);
    color: var(--interactive-overlay-text);
    left: max(var(--gutter), calc((100vw - var(--wide)) / 2 + var(--gutter)));
    max-width: min(34rem, calc(100vw - (var(--gutter) * 2)));
    position: absolute;
    z-index: 1;
  }

  .story-hero.immersive .overlay-dek,
  .story-hero.immersive .overlay-meta {
    backdrop-filter: blur(10px);
    background: linear-gradient(
      180deg,
      var(--interactive-overlay-start),
      var(--interactive-overlay-end)
    );
    border: 1px solid var(--interactive-overlay-border);
    border-radius: 0.5rem;
    box-shadow: 0 0.75rem 2rem var(--interactive-shadow);
    padding: var(--space-3) var(--space-4);
  }

  .story-hero.immersive h1,
  .story-hero.immersive .eyebrow {
    color: var(--interactive-overlay-heading);
  }

  .story-hero.immersive .lede,
  .story-hero.immersive .meta {
    color: var(--interactive-overlay-text);
  }

  .story-hero.immersive h1 {
    max-width: 12ch;
  }

  .story-hero.immersive .lede {
    margin-top: var(--space-3);
    max-width: 32rem;
  }

  .story-hero.immersive .meta span:not(:last-child)::after {
    color: rgb(255 255 255 / 0.58);
  }

  .story-hero.immersive .overlay-meta {
    margin-top: var(--space-3);
  }

  .story-hero.immersive .immersive-caption {
    margin: var(--space-2) auto 0;
    max-width: var(--measure);
    padding: 0 var(--gutter);
  }

  .mobile-immersive-copy {
    display: none;
  }

  .story-body {
    --story-block-gap: clamp(3.5rem, 5vw, 4.75rem);

    display: grid;
    gap: var(--story-block-gap);
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    width: 100%;
  }

  .story-content {
    margin: 0 auto;
    max-width: calc(var(--wide) + (var(--gutter) * 2));
    padding: 0 var(--gutter);
  }

  .story-body > :global(*) {
    margin-block: 0 !important;
    min-width: 0;
  }

  .story-content.with-contents {
    align-items: start;
    display: grid;
    gap: clamp(var(--space-6), 5vw, var(--space-8));
    grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
  }

  .story-contents {
    max-height: calc(100svh - var(--site-header-height) - (var(--space-5) * 2));
    overflow-y: auto;
    position: sticky;
    scrollbar-gutter: stable;
    top: calc(var(--site-header-height) + var(--space-5));
  }

  .story-contents-label {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: var(--line-height-small);
    margin: 0 0 var(--space-3);
    text-transform: uppercase;
  }

  .story-contents-nav {
    border-top: 1px solid color-mix(in srgb, var(--color-line) 76%, transparent);
    display: grid;
  }

  .story-contents-link {
    border-bottom: 1px solid color-mix(in srgb, var(--color-line) 68%, transparent);
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: 0.94rem;
    font-weight: 600;
    line-height: 1.35;
    padding: 0.85rem 0;
    text-decoration: none;
  }

  .story-contents-link:hover,
  .story-contents-link:focus-visible {
    color: var(--link-hover);
    text-decoration: none;
  }

  .story-contents-link.is-active {
    color: var(--link-hover);
    padding-left: 0.7rem;
    position: relative;
  }

  .story-contents-link.is-active::before {
    background: var(--color-accent);
    border-radius: 999px;
    content: '';
    height: 1.05rem;
    left: 0;
    position: absolute;
    top: 0.9rem;
    width: 0.18rem;
  }

  @media (max-width: 860px) {
    .story-content,
    .story-body {
      max-width: 100%;
      min-width: 0;
    }

    .story-body > :global(*) {
      max-width: 100%;
    }

    .story-body {
      --story-block-gap: clamp(2.75rem, 10vw, 3.5rem);
    }

    .story {
      --site-header-height: 3.625rem;
    }

    .story-content.with-contents {
      grid-template-columns: minmax(0, 1fr);
    }

    .story-contents {
      max-height: none;
      overflow: visible;
      position: static;
    }

    .story-hero.split,
    .story-hero.contained {
      display: block;
      min-height: 0;
      padding-top: 3rem;
    }

    .story-hero.split {
      margin: 0;
    }

    .story-hero.contained {
      padding-bottom: var(--space-4);
    }

    h1 {
      font-size: clamp(2rem, 9vw, 2.85rem);
    }

    .story-hero.split .hero-copy {
      padding: 0 var(--gutter) var(--space-6);
    }

    .story-hero.split .hero-media {
      margin-top: 0;
    }

    .story-hero.contained .hero-media {
      margin-top: var(--space-5);
    }

    .story-hero.split img,
    .story-hero.split video,
    .story-hero.contained img,
    .story-hero.contained video {
      aspect-ratio: 4 / 3;
      height: auto;
      min-height: 0;
    }

    figcaption {
      padding: 0 var(--gutter);
    }

    .story-hero.immersive .hero-media {
      min-height: 0;
    }

    .story-hero.immersive .hero-media::after {
      background: linear-gradient(180deg, rgb(0 0 0 / 0.05) 0%, rgb(0 0 0 / 0.5) 100%);
    }

    .story-hero.immersive img,
    .story-hero.immersive video {
      aspect-ratio: 4 / 5;
      height: auto;
      min-height: 27rem;
    }

    .hero-overlay {
      bottom: var(--space-5);
      left: var(--gutter);
    }

    .story-hero.immersive .overlay-dek,
    .story-hero.immersive .overlay-meta {
      display: none;
    }

    .story-hero.immersive h1 {
      font-size: clamp(2rem, 9vw, 2.85rem);
      max-width: 11ch;
    }

    .mobile-immersive-copy {
      display: block;
      margin: 0 auto;
      max-width: calc(var(--measure) + (var(--gutter) * 2));
      padding: var(--space-5) var(--gutter) 0;
    }

    .story-hero.immersive .mobile-immersive-copy .lede {
      color: var(--color-muted);
    }

    .story-hero.immersive .mobile-immersive-copy .meta {
      color: var(--color-muted);
    }

    .story-hero.immersive .mobile-immersive-copy .meta span:not(:last-child)::after {
      color: var(--color-faint);
    }
  }

  @media print {
    .story {
      background: white;
      overflow: visible;
    }

    .story-hero.split,
    .story-hero.contained,
    .story-hero.immersive {
      display: block;
      margin: 0;
      max-width: none;
      min-height: 0;
      padding: 0;
    }

    .story-hero.split,
    .story-hero.contained,
    .story-hero.immersive .hero-media {
      break-inside: avoid;
    }

    .story-hero.split .hero-copy,
    .story-hero.contained .hero-copy,
    .story-hero.immersive .hero-overlay {
      background: #fff !important;
      color: #1f1f1f;
      margin: 0 0 7mm;
      max-width: none;
      padding: 0;
      position: static;
    }

    .story-hero.immersive .hero-media {
      background: #fff !important;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .story-hero.immersive .hero-overlay {
      order: -1;
    }

    .story-hero.immersive .overlay-dek,
    .story-hero.immersive .overlay-meta {
      backdrop-filter: none;
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      display: block;
      padding: 0;
    }

    .story-hero.immersive h1,
    .story-hero.immersive .lede,
    .story-hero.immersive .meta,
    .story-hero.immersive .eyebrow {
      color: #1f1f1f;
    }

    .story-hero h1,
    .story-hero.immersive h1 {
      font-size: 28pt;
      line-height: 1.08;
      margin: 0 0 4mm;
      max-width: 18ch;
    }

    .story-hero .lede,
    .story-hero.immersive .lede {
      color: #444;
      font-size: 12pt;
      line-height: 1.45;
      margin: 0 0 4mm;
      max-width: 42em;
    }

    .story-hero .meta,
    .story-hero.immersive .overlay-meta {
      color: #555;
      font-size: 8.5pt;
      margin: 0;
    }

    .story-hero .hero-media {
      margin: 0;
      max-width: none;
      min-height: 0;
    }

    .story-hero .hero-media::after {
      content: none;
    }

    .story-hero img,
    .story-hero video,
    .story-hero.immersive img,
    .story-hero.immersive video {
      aspect-ratio: auto !important;
      border: 0;
      display: block;
      height: 88mm !important;
      max-height: 88mm;
      min-height: 0 !important;
      object-fit: cover;
      object-position: center;
      width: 100%;
    }

    .story-hero figcaption,
    .story-hero .immersive-caption {
      font-size: 8pt;
      margin: 2mm 0 0;
      max-width: none;
      padding: 0;
    }

    .mobile-immersive-copy {
      display: none;
    }

    .story-content,
    .story-content.with-contents {
      background: white;
      display: block;
      margin: 0;
      max-width: none;
      padding: 0;
    }

    .story-contents {
      display: none;
    }

    .story-body {
      --story-block-gap: 7mm;

      background: white;
      display: grid;
      gap: var(--story-block-gap);
      width: 100%;
    }
  }
</style>
