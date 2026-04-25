<script lang="ts">
  import type { QuoteBlock } from '$lib/content/types';

  let { block }: { block: QuoteBlock } = $props();
</script>

<figure class="quote-block">
  <blockquote>
    <p>{block.text}</p>
  </blockquote>
  {#if block.attribution}
    <figcaption>{block.attribution}</figcaption>
  {/if}
</figure>

<style>
  .quote-block {
    border-left: 1px solid var(--color-line-strong);
    margin: var(--block-space) auto;
    max-width: var(--measure-prose);
    padding: var(--space-2) 0 var(--space-2) var(--space-5);
  }

  blockquote {
    margin: 0;
  }

  p {
    font-family: var(--font-serif);
    font-size: clamp(1.45rem, 2.4vw, 2.05rem);
    font-weight: 500;
    line-height: 1.24;
    margin: 0;
    text-wrap: balance;
  }

  figcaption {
    color: var(--color-muted);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-meta);
    letter-spacing: 0.09em;
    line-height: var(--line-height-small);
    margin-top: var(--space-4);
    text-transform: uppercase;
  }

  @media (max-width: 620px) {
    .quote-block {
      margin: 3.5rem auto;
    }
  }
</style>
