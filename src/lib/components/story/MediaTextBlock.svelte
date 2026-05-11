<script lang="ts">
  import { base } from '$app/paths';
  import type { ImageAsset, MediaTextBlock, VideoAsset } from '$lib/content/types';
  import { autoplayWhileVisible } from './videoAutoplayViewport';
  import { shareVideoAsset } from './videoShare';

  let { block }: { block: MediaTextBlock } = $props();
  let mediaSide = $derived(block.mediaSide ?? 'right');
  let image = $derived(block.media.type === 'image' ? (block.media.asset as ImageAsset) : undefined);
  let video = $derived(block.media.type === 'video' ? (block.media.asset as VideoAsset) : undefined);
  let shareFeedback = $state('');

  function clearFeedbackSoon() {
    window.setTimeout(() => {
      shareFeedback = '';
    }, 1800);
  }

  async function shareVideo() {
    if (!video) return;

    const result = await shareVideoAsset({
      src: video.src,
      title: 'Inside Parliament video',
      text: video.caption ?? undefined
    });

    if (result === 'copied') {
      shareFeedback = 'Link copied';
      clearFeedbackSoon();
    }
  }
</script>

<section class="media-text {mediaSide}">
  <div class="copy">
    {#if block.eyebrow}
      <p class="eyebrow">{block.eyebrow}</p>
    {/if}
    {#if block.heading}
      <h2>{block.heading}</h2>
    {/if}
    {#each block.paragraphs as paragraph}
      <p>{@html paragraph}</p>
    {/each}
  </div>

  <figure class:image-figure={!!image} class:video-figure={!!video}>
    {#if image}
      <img src="{base}{image.src}" alt={image.alt} loading="lazy" />
      {#if image.caption || image.credit}
        <figcaption class="caption">
          {image.caption}
          {#if image.credit}
            <span>{image.credit}</span>
          {/if}
        </figcaption>
      {/if}
    {:else if video}
      <video
        use:autoplayWhileVisible={{ enabled: video.autoplay ?? true }}
        autoplay={video.autoplay ?? true}
        controls
        controlslist="nodownload noremoteplayback"
        disablepictureinpicture
        disableremoteplayback
        loop
        muted
        playsinline
        preload="metadata"
        poster={video.poster ? `${base}${video.poster}` : undefined}
      >
        <source src="{base}{video.src}" type="video/mp4" />
        {#if video.captions}
          <track
            kind="captions"
            label="English captions"
            srclang="en"
            src="{base}{video.captions}"
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
      {#if video.caption || video.credit}
        <figcaption class="caption">
          {video.caption}
          {#if video.credit}
            <span>{video.credit}</span>
          {/if}
        </figcaption>
      {/if}
    {/if}
  </figure>
</section>

<style>
  .media-text {
    align-items: center;
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin: var(--block-space) auto;
    max-width: var(--measure);
  }

  .media-text.left figure {
    order: -1;
  }

  .copy {
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

  .copy > p:not(.eyebrow) {
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    margin: 0 0 var(--space-stack);
  }

  .copy > p:not(.eyebrow) :global(a) {
    color: var(--link);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 55%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .copy > p:not(.eyebrow) :global(a:hover),
  .copy > p:not(.eyebrow) :global(a:focus-visible) {
    color: var(--link-hover);
    text-decoration-color: currentColor;
  }

  .copy > p:not(.eyebrow) :global(strong) {
    color: var(--color-accent-2);
    font-weight: 600;
  }

  .copy > p:last-child {
    margin-bottom: 0;
  }

  figure {
    margin: 0;
    min-width: 0;
  }

  .image-figure img {
    background: var(--color-soft);
    aspect-ratio: 4 / 5;
    display: block;
    height: auto;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  .video-figure video {
    background: var(--color-soft);
    display: block;
    height: auto;
    max-height: min(34rem, 76vh);
    object-fit: contain;
    width: auto;
    max-width: 100%;
  }

  .video-figure {
    justify-self: center;
  }

  .video-figure video {
    margin: 0 auto;
  }

  .video-actions {
    align-items: center;
    display: flex;
    gap: 0.75rem;
    justify-content: center;
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
  }

  span {
    color: var(--color-faint);
    display: block;
    margin-top: 0.2rem;
  }

  @media (max-width: 820px) {
    .media-text {
      display: block;
      margin: 3.5rem auto;
    }

    .media-text.left figure {
      order: 0;
    }

    figure {
      margin-top: var(--space-5);
    }

    .image-figure img,
    .video-figure video {
      aspect-ratio: auto;
      max-height: none;
      width: 100%;
    }
  }
</style>
