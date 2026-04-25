<script lang="ts">
  import { base } from '$app/paths';
  import type { Story } from '$lib/content/types';
  import BlockRenderer from './BlockRenderer.svelte';

  let { story }: { story: Story } = $props();
  let heroLayout = $derived(story.heroLayout ?? 'contained');
</script>

<article class="story">
  <header class={`story-hero ${heroLayout}`}>
    {#if heroLayout === 'immersive'}
      <figure class="hero-media">
        <img src="{base}{story.hero.src}" alt={story.hero.alt} fetchpriority="high" />
        <div class="hero-overlay">
          {#if story.eyebrow}
            <p class="eyebrow">{story.eyebrow}</p>
          {/if}
          <h1>{story.title}</h1>
          <p class="lede overlay-dek">{@html story.dek}</p>
          <div class="meta overlay-meta" aria-label="Story details">
            <span>By {story.byline}</span>
            <span>{story.date}</span>
            <span>{story.readingTime}</span>
          </div>
        </div>
      </figure>

      <div class="mobile-immersive-copy">
        <p class="lede">{@html story.dek}</p>
        <div class="meta" aria-label="Story details">
          <span>By {story.byline}</span>
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
          <span>By {story.byline}</span>
          <span>{story.date}</span>
          <span>{story.readingTime}</span>
        </div>
      </div>

      <figure class="hero-media">
        <img src="{base}{story.hero.src}" alt={story.hero.alt} fetchpriority="high" />
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
  </header>

  <div class="story-body">
    {#each story.blocks as block}
      <BlockRenderer {block} />
    {/each}
  </div>
</article>

<style>
  .story {
    overflow: clip;
  }

  .story-hero.split {
    align-items: center;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin: 0 calc(50% - 50vw);
    max-width: none;
    min-height: min(46rem, calc(100vh - 3.25rem));
    padding: 0;
  }

  .hero-copy {
    max-width: var(--measure-prose);
    width: 100%;
  }

  .story-hero.split .hero-copy {
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
    margin: var(--space-stack-loose) 0 0;
    max-width: var(--measure-card);
  }

  .meta span:not(:last-child)::after {
    color: var(--color-faint);
    content: "/";
    margin-left: 0.65rem;
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

  img {
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

  .story-hero.contained img {
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
    min-height: min(48rem, calc(100vh - 3.25rem));
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

  .story-hero.immersive img {
    display: block;
    height: min(48rem, calc(100vh - 3.25rem));
    min-height: 34rem;
  }

  .hero-overlay {
    bottom: clamp(var(--space-7), 8vh, 5rem);
    color: var(--color-paper);
    left: max(var(--gutter), calc((100vw - var(--wide)) / 2 + var(--gutter)));
    max-width: min(34rem, calc(100vw - (var(--gutter) * 2)));
    position: absolute;
    z-index: 1;
  }

  .story-hero.immersive h1,
  .story-hero.immersive .lede,
  .story-hero.immersive .meta,
  .story-hero.immersive .eyebrow {
    color: var(--color-paper);
  }

  .story-hero.immersive h1 {
    max-width: 12ch;
  }

  .story-hero.immersive .lede {
    max-width: 32rem;
  }

  .story-hero.immersive .meta span:not(:last-child)::after {
    color: rgb(255 255 255 / 0.58);
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
    padding: var(--space-4) var(--gutter) 0;
  }

  @media (max-width: 860px) {
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
    .story-hero.contained img {
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

    .story-hero.immersive img {
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
  }
</style>
