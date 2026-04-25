<script lang="ts">
  import type { TextBlock } from '$lib/content/types';

  let { block }: { block: TextBlock } = $props();
</script>

<section class="text-block story-flow" aria-label={block.heading ?? undefined}>
  {#if block.heading}
    <h2>{block.heading}</h2>
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

  h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-stack);
    text-wrap: balance;
  }

  p {
    font-family: var(--font-serif);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    margin: 0 0 var(--space-stack);
  }

  p :global(a) {
    color: var(--link);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 55%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  p :global(a:hover),
  p :global(a:focus-visible) {
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
</style>
