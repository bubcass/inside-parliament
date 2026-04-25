<script lang="ts">
  import { base } from '$app/paths';
  import type { Story } from '$lib/content/types';
  import type { StorySectionMeta } from '$lib/content/stories';
  import { plainTextFromHtml } from '$lib/content/text';

  let { section, stories }: { section: StorySectionMeta; stories: Story[] } = $props();

  let featuredStory = $derived(stories.find((story) => story.featured) ?? stories[0]);
  let secondaryStories = $derived(
    featuredStory ? stories.filter((story) => story.slug !== featuredStory.slug) : []
  );
</script>

<section class="page-shell section-page">
  <header>
    {#if section.eyebrow}
      <p class="eyebrow">{section.eyebrow}</p>
    {/if}
    <h1>{section.title}</h1>
    <p class="lede">{section.intro}</p>
  </header>

  {#if featuredStory}
    <article class="featured-story">
      <a href="{base}/stories/{featuredStory.slug}/">
        <div class="featured-copy">
          <div class="story-context">
            <p>{featuredStory.eyebrow}</p>
          </div>
          <h2>{featuredStory.title}</h2>
          <span class="featured-summary">{plainTextFromHtml(featuredStory.dek)}</span>
          <small>{featuredStory.date} · {featuredStory.readingTime}</small>
        </div>
        <img src="{base}{featuredStory.hero.src}" alt="" loading="eager" />
      </a>
    </article>
  {/if}

  {#if secondaryStories.length}
    <div class="secondary-grid">
      {#each secondaryStories as story}
        <article class="secondary-story">
          <a href="{base}/stories/{story.slug}/">
            <img src="{base}{story.hero.src}" alt="" loading="lazy" />
            <div class="secondary-copy">
              <div class="story-context">
                <p>{story.eyebrow}</p>
              </div>
              <h3>{story.title}</h3>
              <span>{plainTextFromHtml(story.dek)}</span>
              <small>{story.date} · {story.readingTime}</small>
            </div>
          </a>
        </article>
      {/each}
    </div>
  {/if}
</section>

<style>
  .section-page {
    padding-top: clamp(var(--space-7), 7vw, 4.5rem);
  }

  header {
    border-bottom: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
    margin-bottom: var(--space-section);
    padding-bottom: var(--space-6);
  }

  h1 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h1);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-stack-tight);
    text-wrap: balance;
  }

  .lede {
    color: var(--color-muted);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
    max-width: var(--measure-card);
  }

  .featured-story {
    margin-bottom: clamp(var(--space-7), 5vw, 3.5rem);
  }

  .featured-story a {
    border-bottom: 1px solid color-mix(in srgb, var(--color-line) 62%, transparent);
    display: grid;
    gap: clamp(var(--space-6), 4vw, var(--space-8));
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    padding-bottom: var(--space-7);
    text-decoration: none;
  }

  .featured-copy {
    align-self: center;
    max-width: var(--measure-card);
  }

  .story-context {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.55rem;
    margin-bottom: var(--space-3);
  }

  .story-context p {
    color: var(--color-accent);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-meta);
    letter-spacing: 0.11em;
    line-height: var(--line-height-small);
    margin: 0;
    text-transform: uppercase;
  }

  .featured-story h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: clamp(1.75rem, 3vw, 2.4rem);
    font-weight: var(--font-weight-heading);
    line-height: 1.08;
    margin: 0 0 var(--space-4);
    max-width: 14ch;
    text-wrap: balance;
  }

  .featured-summary {
    color: var(--color-muted);
    display: block;
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    max-width: var(--measure-card);
    white-space: pre-line;
  }

  .featured-story img {
    aspect-ratio: 16 / 10;
    background: var(--color-soft);
    object-fit: cover;
    width: 100%;
  }

  .secondary-grid {
    display: grid;
    gap: clamp(var(--space-6), 3vw, var(--space-7));
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .secondary-story a {
    display: grid;
    gap: var(--space-4);
    text-decoration: none;
  }

  .secondary-story img {
    aspect-ratio: 4 / 3;
    background: var(--color-soft);
    object-fit: cover;
    width: 100%;
  }

  .secondary-copy {
    max-width: var(--measure-card);
  }

  .secondary-story h3 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-heading);
    line-height: 1.18;
    margin: 0 0 var(--space-3);
    max-width: 18ch;
    text-wrap: balance;
  }

  .secondary-story span {
    color: var(--color-muted);
    display: block;
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    max-width: var(--measure-card);
    white-space: pre-line;
  }

  small {
    color: var(--color-muted);
    display: block;
    font-size: var(--font-size-small);
    font-weight: 500;
    letter-spacing: 0.07em;
    line-height: var(--line-height-small);
    margin-top: var(--space-4);
    text-transform: uppercase;
  }

  @media (max-width: 900px) {
    .featured-story a {
      grid-template-columns: minmax(0, 1fr);
    }

    .featured-copy {
      max-width: var(--measure-hero);
    }
  }

  @media (max-width: 760px) {
    header {
      margin-bottom: 2.5rem;
      padding-bottom: 1.25rem;
    }

    .lede {
      max-width: 28rem;
    }

    .featured-story a {
      gap: var(--space-5);
      padding-bottom: var(--space-6);
    }

    .featured-story h2 {
      font-size: clamp(1.55rem, 8vw, 2.2rem);
      max-width: 12ch;
    }

    .featured-story img {
      aspect-ratio: 4 / 3;
    }

    .secondary-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
