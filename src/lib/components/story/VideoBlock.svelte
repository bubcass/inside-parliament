<script lang="ts">
  import { base } from '$app/paths';
  import type { VideoBlock } from '$lib/content/types';
  import { autoplayWhileVisible } from './videoAutoplayViewport';
  import { shareVideoAsset } from './videoShare';

  let { block }: { block: VideoBlock } = $props();
  let shareFeedback = $state('');
  let player = $state<HTMLVideoElement | null>(null);
  let isMuted = $state(true);

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

  function toggleSound() {
    if (!player) return;
    player.muted = !player.muted;
    isMuted = player.muted;
  }
</script>

<figure class="video-block">
  <div class="video-player">
    <video
      bind:this={player}
      use:autoplayWhileVisible={{ enabled: block.video.autoplay ?? true }}
      autoplay={block.video.autoplay ?? true}
      loop
      muted={isMuted}
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

  .video-player {
    position: relative;
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
    max-width: var(--measure);
  }

  .caption span {
    color: var(--color-faint);
    display: block;
    margin-top: 0.2rem;
  }

  @media (max-width: 620px) {
    .video-block {
      margin: 3.5rem auto;
    }
  }

  @media print {
    .video-block {
      break-inside: avoid;
      margin: 7mm 0;
      max-width: none;
    }

    video,
    .video-actions {
      display: none;
    }

    figcaption {
      border-top: 1px solid var(--color-line);
      font-size: 8pt;
      margin-top: 2mm;
      max-width: none;
      padding-top: 2mm;
    }
  }
</style>
