<script lang="ts">
  import type { QuoteBlock } from '$lib/content/types';

  let { block }: { block: QuoteBlock } = $props();
</script>

<figure class="quote-block">
  <blockquote>
    <div class="quote-copy">
      {@html block.text}
    </div>
  </blockquote>
  {#if block.attribution}
    <figcaption>{block.attribution}</figcaption>
  {/if}
</figure>

<style>
  .quote-block {
    border-left: 8px solid var(--color-line);
    margin: var(--block-space) auto;
    max-width: var(--measure-prose);
    padding: 0 0 0 var(--space-5);
  }

  blockquote {
    margin: 0;
  }

  .quote-copy {
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    font-weight: 400;
    line-height: 1.55;
    margin: 0;
  }

  .quote-copy :global(p) {
    margin: 0;
  }

  .quote-copy :global(br + br) {
    display: block;
    content: "";
    margin-top: var(--space-3);
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
      margin: 3rem auto;
      padding-left: var(--space-4);
    }
  }

  @media print {
    .quote-block {
      break-inside: avoid;
      border-left-width: 2mm;
      margin: 8mm 0;
      max-width: none;
      padding-left: 5mm;
    }

    .quote-copy {
      font-size: 11pt;
      line-height: 1.45;
    }

    figcaption {
      font-size: 8pt;
      margin-top: 3mm;
    }
  }
</style>
