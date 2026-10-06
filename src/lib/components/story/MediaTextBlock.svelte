<script lang="ts">
  import { base } from '$app/paths';
  import type { ImageAsset, MediaTextBlock, VideoAsset } from '$lib/content/types';
  import { autoplayWhileVisible } from './videoAutoplayViewport';
  import { shareVideoAsset } from './videoShare';

  let { block, headingId }: { block: MediaTextBlock; headingId?: string } = $props();
  let mediaSide = $derived(block.mediaSide ?? 'right');
  let fit = $derived(block.fit ?? 'cover');
  let image = $derived(block.media.type === 'image' ? (block.media.asset as ImageAsset) : undefined);
  let video = $derived(block.media.type === 'video' ? (block.media.asset as VideoAsset) : undefined);
  let shareFeedback = $state('');
  let player = $state<HTMLVideoElement | null>(null);
  let isMuted = $state(true);

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

  function toggleSound() {
    if (!player) return;
    player.muted = !player.muted;
    isMuted = player.muted;
  }
</script>

<section class="media-text {mediaSide}">
  <div class="copy">
    {#if block.eyebrow}
      <p class="eyebrow">{block.eyebrow}</p>
    {/if}
    {#if block.heading}
      <h2 id={headingId}>{block.heading}</h2>
    {/if}
    {#each block.paragraphs as paragraph}
      <p>{@html paragraph}</p>
    {/each}
  </div>

  <figure class:image-figure={!!image} class:video-figure={!!video} class:contain={fit === 'contain'}>
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
      <div class="video-player">
        <video
          bind:this={player}
          use:autoplayWhileVisible={{ enabled: video.autoplay ?? true }}
          autoplay={video.autoplay ?? true}
          loop
          muted={isMuted}
          playsinline
          preload="metadata"
          poster={video.poster ? `${base}{video.poster}` : undefined}
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
        <div class="video-actions" aria-label="Video controls">
          <button type="button" class="video-action" onclick={toggleSound} aria-label={isMuted ? 'Turn sound on' : 'Mute video'} aria-pressed={!isMuted}>
            {#if isMuted}
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2 3 3m0-3-3 3" /></svg>
            {:else}
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5-3.5a5 5 0 0 1 0 7m2-10a9 9 0 0 1 0 13" /></svg>
            {/if}
          </button>
          <button type="button" class="video-action" onclick={shareVideo} aria-label="Share video">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V3m0 0-4 4m4-4 4 4M5 10v9h14v-9" /></svg>
          </button>
        </div>
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
    align-items: start;
    display: grid;
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin: var(--block-space) auto;
    max-width: var(--measure-prose);
    min-width: 0;
    width: min(100%, var(--measure-prose));
  }

  .media-text.left figure {
    order: -1;
  }

  .copy {
    min-width: 0;
    max-width: var(--measure-prose);
  }

  h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-stack);
    scroll-margin-top: calc(var(--site-header-height, 3.25rem) + var(--space-5));
    text-wrap: balance;
  }

  .copy > p:not(.eyebrow) {
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    margin: 0 0 var(--space-stack);
    overflow-wrap: break-word;
  }

  .copy > p:not(.eyebrow) :global(a) {
    color: var(--link);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 55%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .copy > p:not(.eyebrow) :global(a)::after {
    content: "↗";
    display: inline-block;
    font-size: 0.8em;
    margin-left: 0.14em;
    text-decoration: none;
    transform: translateY(-0.08em);
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

  .image-figure.contain img {
    aspect-ratio: auto;
    object-fit: contain;
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

  .video-player {
    position: relative;
  }

  .video-figure {
    justify-self: center;
  }

  .video-figure video {
    margin: 0 auto;
  }

  .video-actions {
    display: grid;
    gap: 0.7rem;
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .video-action {
    align-items: center;
    backdrop-filter: blur(8px);
    background: rgba(16, 15, 12, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.48);
    border-radius: 999px;
    color: white;
    cursor: pointer;
    display: inline-flex;
    font-size: 1.3rem;
    line-height: 1;
    height: 2.8rem;
    justify-content: center;
    padding: 0;
    width: 2.8rem;
  }

  .video-action:hover,
  .video-action:focus-visible {
    color: var(--link-hover);
  }

  .video-action svg {
    fill: none;
    height: 1.55rem;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
    width: 1.55rem;
  }

  .video-feedback {
    background: rgba(16, 15, 12, 0.82);
    border-radius: 999px;
    bottom: 0.8rem;
    color: white;
    font-size: var(--font-size-small);
    font-weight: 500;
    line-height: var(--line-height-small);
    padding: 0.35rem 0.6rem;
    position: absolute;
    right: 0.75rem;
  }

  .caption {
    margin-left: auto;
    margin-right: auto;
  }

  .caption span {
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

  @media print {
    .media-text,
    .media-text.left,
    .media-text.right {
      display: block;
      margin: 8mm 0;
      max-width: none;
    }

    .copy {
      max-width: none;
    }

    h2 {
      break-after: avoid;
      color: #1f1f1f;
      font-size: 18pt;
      margin-bottom: 3mm;
    }

    .copy > p:not(.eyebrow) {
      font-size: 10.5pt;
      line-height: 1.55;
      margin-bottom: 3.5mm;
      orphans: 3;
      widows: 3;
    }

    figure,
    .media-text.left figure {
      break-inside: avoid;
      margin: 5mm auto 0;
      max-width: 110mm;
      order: 0;
    }

    .image-figure img {
      aspect-ratio: auto;
      display: block;
      height: auto;
      margin-inline: auto;
      max-height: 110mm;
      max-width: 100%;
      object-fit: contain;
      width: auto;
    }

    .video-figure video,
    .video-actions {
      display: none;
    }

    .caption {
      font-size: 8pt;
      line-height: 1.35;
      margin-top: 2mm;
    }

    .copy > p:not(.eyebrow) :global(a)::after {
      content: none;
    }
  }
</style>
