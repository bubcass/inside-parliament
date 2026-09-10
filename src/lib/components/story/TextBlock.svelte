<script lang="ts">
  import type { TextBlock } from '$lib/content/types';

  let { block, headingId }: { block: TextBlock; headingId?: string } = $props();
  let headingTag = $derived(block.headingLevel === 3 ? 'h3' : 'h2');
</script>

<section class="text-block story-flow" aria-label={block.heading ?? undefined}>
  {#if block.heading}
    <svelte:element this={headingTag} id={headingId}>{block.heading}</svelte:element>
  {/if}
  {#each block.paragraphs as paragraph}
    <p>{@html paragraph}</p>
  {/each}
</section>

<style>
  .text-block {
    margin: clamp(var(--space-7), 5vw, 4rem) auto;
    max-width: var(--measure-prose);
  }

  h2,
  h3 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-stack);
    scroll-margin-top: calc(var(--site-header-height, 3.25rem) + var(--space-5));
    text-wrap: balance;
  }

  h2 {
    font-size: var(--font-size-h2);
  }

  h3 {
    font-size: var(--font-size-h3);
  }

  p {
    font-family: var(--font-serif);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    margin: 0 0 var(--space-stack);
  }

  .text-block :global(a) {
    color: var(--link);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 55%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .text-block :global(a)::after {
    content: "↗";
    display: inline-block;
    font-size: 0.8em;
    margin-left: 0.14em;
    text-decoration: none;
    transform: translateY(-0.08em);
  }

  .text-block :global(a[href^="#footnote-"])::after {
    content: none;
  }

  .text-block :global([id^="footnote-"]) {
    scroll-margin-top: 7rem;
  }

  .text-block :global(a:hover),
  .text-block :global(a:focus-visible) {
    color: var(--link-hover);
    text-decoration-color: currentColor;
  }

  p :global(strong) {
    color: var(--color-accent-2);
    font-weight: 600;
  }

  p:first-of-type {
    margin-top: 0;
  }

  @media (max-width: 620px) {
    .text-block {
      margin: 3rem auto;
    }
  }

  @media print {
    .text-block {
      margin: 0 0 7mm;
      max-width: none;
    }

    h2,
    h3 {
      break-after: avoid;
      color: #1f1f1f;
      margin-bottom: 3mm;
    }

    h2 {
      font-size: 18pt;
    }

    h3 {
      font-size: 13pt;
    }

    p {
      font-size: 10.5pt;
      line-height: 1.55;
      margin-bottom: 3.5mm;
      orphans: 3;
      widows: 3;
    }

    .text-block :global(a)::after {
      content: none;
    }

    .text-block :global([id^="footnote-"]) {
      break-inside: avoid;
      font-size: 8.5pt;
      line-height: 1.4;
    }
  }
</style>
