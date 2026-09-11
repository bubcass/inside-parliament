<script lang="ts">
  import { base } from '$app/paths';
  import type { ImageBlock } from '$lib/content/types';

  let { block }: { block: ImageBlock } = $props();
  let layout = $derived(block.layout ?? 'inline');
  let fit = $derived(block.fit ?? 'cover');
</script>

<figure class="image-block {layout} {fit}">
  <img src="{base}{block.image.src}" alt={block.image.alt} loading="lazy" />
  {#if block.image.caption || block.image.credit}
    <figcaption class="caption">
      {block.image.caption}
      {#if block.image.credit}
        <span>{block.image.credit}</span>
      {/if}
    </figcaption>
  {/if}
</figure>

<style>
  .image-block {
    margin: var(--block-space) auto;
  }

  .inline {
    max-width: var(--measure);
  }

  .wide {
    max-width: min(var(--wide), calc(100vw - (var(--gutter) * 2)));
  }

  .full {
    max-width: none;
    width: 100%;
  }

  img {
    background: var(--color-soft);
    border: 1px solid var(--color-line);
    object-fit: cover;
    width: 100%;
  }

  .wide img,
  .full img {
    aspect-ratio: 16 / 9;
  }

  .inline img {
    aspect-ratio: 4 / 3;
  }

  .contain img,
  .contain.inline img,
  .contain.wide img,
  .contain.full img {
    aspect-ratio: auto;
    height: auto;
    object-fit: contain;
  }

  figcaption {
    margin-left: auto;
    margin-right: auto;
  }

  span {
    color: var(--color-faint);
    display: block;
    margin-top: 0.2rem;
  }

  @media (max-width: 620px) {
    .image-block {
      margin: 3.5rem auto;
    }

    .wide {
      max-width: none;
      width: 100%;
    }

    .wide img,
    .full img {
      aspect-ratio: 4 / 3;
    }
  }

  @media print {
    .image-block,
    .inline,
    .wide,
    .full {
      break-inside: avoid;
      margin: 7mm auto;
      max-width: 155mm;
      width: 100%;
    }

    img,
    .inline img,
    .wide img,
    .full img {
      aspect-ratio: auto;
      border: 0;
      height: auto;
      max-height: 155mm;
      object-fit: contain;
      width: 100%;
    }

    figcaption {
      font-size: 8pt;
      line-height: 1.35;
      margin-top: 2mm;
    }
  }
</style>
