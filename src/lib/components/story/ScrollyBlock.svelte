<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import type { ScrollyBlock } from '$lib/content/types';

  let { block }: { block: ScrollyBlock } = $props();
  let activeIndex = $state(0);
  let stepNodes: HTMLElement[] = [];
  let headingId = $derived(
    `scrolly-${block.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'story-block'}`
  );

  onMount(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target instanceof HTMLElement) {
          activeIndex = Number(visible.target.dataset.index ?? 0);
        }
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0.15, 0.35, 0.6]
      }
    );

    stepNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  });
</script>

<section class="scrolly" aria-labelledby={headingId}>
  <div class="scrolly-intro">
    <p class="eyebrow">Visual explainer</p>
    <h2 id={headingId}>{block.title}</h2>
    {#if block.intro}
      <p>{block.intro}</p>
    {/if}
  </div>

  <div class="scrolly-grid">
    <div class="media-sticky">
      {#each block.steps as step, index}
        <figure class:active={index === activeIndex}>
          <img src="{base}{step.image.src}" alt={step.image.alt} loading={index === 0 ? 'eager' : 'lazy'} />
          <figcaption class="caption">{step.title}</figcaption>
        </figure>
      {/each}
    </div>

    <div class="steps">
      {#each block.steps as step, index}
        <article
          class:active={index === activeIndex}
          data-index={index}
          bind:this={stepNodes[index]}
          aria-current={index === activeIndex ? 'step' : undefined}
        >
          <figure class="step-media">
            <img src="{base}{step.image.src}" alt={step.image.alt} loading="lazy" />
            <figcaption class="caption">{step.title}</figcaption>
          </figure>
          {#if step.eyebrow}
            <p class="step-eyebrow">{step.eyebrow}</p>
          {/if}
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .scrolly {
    background: transparent;
    margin: var(--block-space) calc(var(--gutter) * -1);
    padding: var(--space-8) var(--gutter);
  }

  .scrolly-intro,
  .scrolly-grid {
    margin: 0 auto;
    max-width: var(--wide);
  }

  .scrolly-intro {
    max-width: var(--measure-prose);
  }

  h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-3);
    text-wrap: balance;
  }

  .scrolly-intro > p:last-child {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
  }

  .scrolly-grid {
    display: grid;
    gap: clamp(var(--space-6), 5vw, var(--space-8));
    grid-template-columns: minmax(0, 1.18fr) minmax(18rem, 0.82fr);
    margin-top: var(--space-7);
  }

  .media-sticky {
    align-self: start;
    min-height: 31rem;
    position: sticky;
    top: 5.25rem;
  }

  .media-sticky figure {
    inset: 0;
    margin: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 360ms ease;
  }

  .media-sticky figure.active {
    opacity: 1;
    pointer-events: auto;
    position: relative;
  }

  img {
    aspect-ratio: 4 / 3;
    background: var(--color-soft);
    object-fit: cover;
    width: 100%;
  }

  .step-media img {
    border: 1px solid var(--color-line);
  }

  .steps {
    display: grid;
    gap: clamp(var(--space-8), 15vh, 6.5rem);
    padding: var(--space-4) 0 var(--space-7);
  }

  article {
    border-left: 1px solid var(--color-line);
    padding: 0 0 0 var(--space-4);
  }

  article.active {
    border-color: var(--color-accent);
  }

  .step-eyebrow {
    color: var(--color-accent);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-meta);
    letter-spacing: 0.11em;
    line-height: var(--line-height-small);
    margin: 0 0 var(--space-2);
    text-transform: uppercase;
  }

  h3 {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-heading);
    line-height: 1.2;
    margin: 0 0 var(--space-2);
    text-wrap: balance;
  }

  article p:last-child {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
  }

  article.active h3 {
    color: var(--color-accent-2);
  }

  article:not(.active) .step-eyebrow {
    color: var(--color-muted);
  }

  .step-media {
    display: none;
  }

  @media (max-width: 820px) {
    .scrolly {
      margin: 3.75rem calc(var(--gutter) * -1);
      padding-bottom: var(--space-7);
      padding-top: var(--space-7);
    }

    .scrolly-grid {
      display: block;
    }

    .media-sticky {
      display: none;
    }

    .step-media {
      display: block;
      margin: 0 0 var(--space-3);
    }

    .step-media img {
      aspect-ratio: 16 / 10;
    }

    .step-media .caption {
      margin-bottom: var(--space-3);
    }

    .step-media + .step-eyebrow {
      margin-top: 0;
    }

    .steps {
      gap: var(--space-7);
      padding: var(--space-6) 0 0;
    }

    article {
      border-left-color: var(--color-line);
      padding-left: var(--space-4);
    }
  }
</style>
