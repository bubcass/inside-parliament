<script lang="ts">
  import { base } from '$app/paths';
  import type { VideoBlock } from '$lib/content/types';

  let { block }: { block: VideoBlock } = $props();
</script>

<figure class="video-block">
  <video
    autoplay
    loop
    muted
    playsinline
    preload="metadata"
    poster={block.video.poster ? `${base}${block.video.poster}` : undefined}
  >
    <source src="{base}{block.video.src}" type="video/mp4" />
    {#if block.video.captions}
      <track
        kind="captions"
        label="English captions"
        srclang="en"
        src="{base}{block.video.captions}"
        default
      />
    {/if}
  </video>
  {#if block.video.caption || block.video.credit}
    <figcaption class="caption">
      {block.video.caption}
      {#if block.video.credit}
        <span>{block.video.credit}</span>
      {/if}
    </figcaption>
  {/if}
</figure>

<style>
  .video-block {
    margin: var(--block-space) auto;
    max-width: min(var(--wide), calc(100vw - (var(--gutter) * 2)));
  }

  video {
    aspect-ratio: 16 / 9;
    background: #111;
    border: 1px solid var(--color-line);
    width: 100%;
  }

  figcaption {
    max-width: var(--measure);
  }

  span {
    color: var(--color-faint);
    display: block;
    margin-top: 0.2rem;
  }

  @media (max-width: 620px) {
    .video-block {
      margin: 3.5rem auto;
    }
  }
</style>
