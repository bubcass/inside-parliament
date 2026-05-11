<script lang="ts">
  import { base } from '$app/paths';
  import type { VideoBlock } from '$lib/content/types';
  import { autoplayWhileVisible } from './videoAutoplayViewport';
  import { shareVideoAsset } from './videoShare';

  let { block }: { block: VideoBlock } = $props();
  let shareFeedback = $state('');

  function clearFeedbackSoon() {
    window.setTimeout(() => {
      shareFeedback = '';
    }, 1800);
  }

  async function shareVideo() {
    const result = await shareVideoAsset({
      src: block.video.src,
      title: 'Inside Parliament video',
      text: block.video.caption ?? undefined
    });

    if (result === 'copied') {
      shareFeedback = 'Link copied';
      clearFeedbackSoon();
    }
  }
</script>

<figure class="video-block">
  <video
    use:autoplayWhileVisible={{ enabled: block.video.autoplay ?? true }}
    autoplay={block.video.autoplay ?? true}
    controls
    controlslist="nodownload noremoteplayback"
    disablepictureinpicture
    disableremoteplayback
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
  <div class="video-actions">
    <button type="button" class="video-action" onclick={shareVideo}>
      Share video
    </button>
    {#if shareFeedback}
      <span class="video-feedback" role="status">{shareFeedback}</span>
    {/if}
  </div>
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

  .video-actions {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    margin-top: var(--space-3);
  }

  .video-action {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--color-line) 82%, transparent);
    border-radius: var(--radius);
    color: var(--color-accent-2);
    cursor: pointer;
    font: inherit;
    font-size: var(--font-size-small);
    font-weight: 600;
    line-height: 1;
    padding: 0.55rem 0.8rem;
  }

  .video-action:hover,
  .video-action:focus-visible {
    color: var(--link-hover);
  }

  .video-feedback {
    color: var(--color-muted);
    font-size: var(--font-size-small);
    font-weight: 500;
    line-height: var(--line-height-small);
    margin-top: 0;
  }

  .caption {
    margin-left: auto;
    margin-right: auto;
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
