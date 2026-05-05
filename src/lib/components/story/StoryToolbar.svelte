<script lang="ts">
  import { base } from '$app/paths';
  import { onDestroy, onMount } from 'svelte';
  import type { Story } from '$lib/content/types';
  import { BOOKMARK_KEY, readBookmarks } from './bookmarks';
  import { plainText, storyBlockCopy } from './storyToolbar';

  type AudioManifestEntry = {
    src: string;
    generatedAt: string;
    provider: string;
  };

  let { story }: { story: Story } = $props();

  let isClient = $state(false);
  let isPlaying = $state(false);
  let isBookmarked = $state(false);
  let isLoadingAudio = $state(false);
  let shareFeedback = $state('');
  let generatedAudioSrc = $state<string | null>(null);
  let utterance: SpeechSynthesisUtterance | null = null;
  let audio: HTMLAudioElement | null = null;

  let storyAudioText = $derived(
    [story.title, story.dek, ...story.blocks.map(storyBlockCopy)]
      .filter(Boolean)
      .map((part) => plainText(part))
      .join(' ')
  );

  let playbackLabel = $derived.by(() => {
    if (generatedAudioSrc) {
      if (isLoadingAudio) return 'Loading audio';
      return isPlaying ? 'Pause story' : 'Play story';
    }

    return isPlaying ? 'Stop listening' : 'Listen to the story';
  });

  function storyUrl() {
    if (!isClient) return `${base}/stories/${story.slug}/`;
    return window.location.href;
  }

  function assetUrl(path: string, version?: string) {
    if (!isClient) {
      return version ? `${base}${path}?v=${version}` : `${base}${path}`;
    }

    const url = new URL(`${base}${path}`, window.location.origin);
    if (version) {
      url.searchParams.set('v', version);
    }

    return url.toString();
  }

  function clearFeedbackSoon() {
    window.setTimeout(() => {
      shareFeedback = '';
    }, 1800);
  }

  function stopSpeechPlayback() {
    if (!isClient || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utterance = null;
    isPlaying = false;
  }

  function setMediaSessionPlaybackState(state: MediaSessionPlaybackState) {
    if (!isClient || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state;
  }

  function clearMediaSession() {
    if (!isClient || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';

    for (const action of ['play', 'pause', 'stop', 'seekbackward', 'seekforward'] as const) {
      navigator.mediaSession.setActionHandler(action, null);
    }
  }

  function configureMediaSession() {
    if (!isClient || !audio || !generatedAudioSrc || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = null;
    const artworkVersion = `story-${story.slug}-${Date.now()}`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: story.title,
      artist: 'Inside Parliament',
      album: 'Inside Parliament',
      artwork: [
        {
          src: assetUrl('/brand/Inside Parliament.png', artworkVersion),
          sizes: '1080x1350',
          type: 'image/png'
        }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      void audio?.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audio?.pause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      stopAudioPlayback();
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (!audio) return;
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (!audio || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    });
  }

  function stopAudioPlayback() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    setMediaSessionPlaybackState('paused');
  }

  function stopAllPlayback() {
    stopSpeechPlayback();
    stopAudioPlayback();
  }

  function playGeneratedAudio() {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      setMediaSessionPlaybackState('paused');
      return;
    }

    stopSpeechPlayback();
    isLoadingAudio = true;

    void audio.play()
      .then(() => {
        isLoadingAudio = false;
        isPlaying = true;
      })
      .catch((error) => {
        console.error(error);
        isLoadingAudio = false;
        isPlaying = false;
      });
  }

  function playSpeechFallback() {
    if (!isClient || !window.speechSynthesis || !storyAudioText) return;

    if (isPlaying) {
      stopSpeechPlayback();
      return;
    }

    stopAllPlayback();
    clearMediaSession();

    utterance = new SpeechSynthesisUtterance(storyAudioText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      isPlaying = false;
      utterance = null;
    };
    utterance.onerror = () => {
      isPlaying = false;
      utterance = null;
    };

    isPlaying = true;
    window.speechSynthesis.speak(utterance);
  }

  function togglePlayback() {
    if (generatedAudioSrc) {
      playGeneratedAudio();
      return;
    }

    playSpeechFallback();
  }

  async function shareStory() {
    if (!isClient) return;

    const shareData = {
      title: story.title,
      text: plainText(story.dek),
      url: storyUrl()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      shareFeedback = 'Link copied';
      clearFeedbackSoon();
    }
  }

  function writeBookmarks(next: string[]) {
    if (!isClient) return;
    window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  }

  function toggleBookmark() {
    if (!isClient) return;

    const bookmarks = readBookmarks();
    const next = isBookmarked
      ? bookmarks.filter((slug) => slug !== story.slug)
      : [...new Set([...bookmarks, story.slug])];

    writeBookmarks(next);
    isBookmarked = next.includes(story.slug);
  }

  async function loadGeneratedAudio() {
    try {
      const response = await fetch(`${base}/audio/stories/manifest.json`);
      if (!response.ok) return;

      const manifest = (await response.json()) as Record<string, AudioManifestEntry>;
      const entry = manifest[story.slug];
      if (!entry?.src) return;

      generatedAudioSrc = `${base}${entry.src}`;
      audio = new Audio(generatedAudioSrc);
      audio.preload = 'metadata';
      configureMediaSession();
      audio.addEventListener('play', () => {
        isLoadingAudio = false;
        isPlaying = true;
        setMediaSessionPlaybackState('playing');
      });
      audio.addEventListener('pause', () => {
        isPlaying = false;
        setMediaSessionPlaybackState('paused');
      });
      audio.addEventListener('ended', () => {
        isPlaying = false;
        setMediaSessionPlaybackState('paused');
      });
      audio.addEventListener('waiting', () => {
        isLoadingAudio = true;
      });
      audio.addEventListener('canplay', () => {
        isLoadingAudio = false;
      });
      audio.addEventListener('error', () => {
        generatedAudioSrc = null;
        isLoadingAudio = false;
        clearMediaSession();
        audio = null;
      });
    } catch {
      generatedAudioSrc = null;
    }
  }

  onMount(() => {
    isClient = true;
    isBookmarked = readBookmarks().includes(story.slug);
    void loadGeneratedAudio();
  });

  onDestroy(() => {
    stopAllPlayback();
    clearMediaSession();
    audio = null;
  });
</script>

<section class="story-toolbar" aria-label="Story actions">
  <div class="story-toolbar__inner">
    <div class="story-toolbar__actions">
      <button
        type="button"
        class="listen-button"
        onclick={togglePlayback}
        aria-pressed={isPlaying}
        aria-label={generatedAudioSrc ? playbackLabel : (isPlaying ? 'Stop listening to the story' : 'Listen to the story')}
        disabled={!generatedAudioSrc && !storyAudioText}
      >
        <span class="listen-button__icon" aria-hidden="true">
          {#if isPlaying && generatedAudioSrc}
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="5" y="4.5" width="3.5" height="11" rx="0.8" fill="currentColor"></rect>
              <rect x="11.5" y="4.5" width="3.5" height="11" rx="0.8" fill="currentColor"></rect>
            </svg>
          {:else if isLoadingAudio}
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.6" stroke-dasharray="16 8"></circle>
            </svg>
          {:else if isPlaying}
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="5" y="4.5" width="3.5" height="11" rx="0.8" fill="currentColor"></rect>
              <rect x="11.5" y="4.5" width="3.5" height="11" rx="0.8" fill="currentColor"></rect>
            </svg>
          {:else}
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M6.5 4.8L15 10L6.5 15.2V4.8Z" fill="currentColor"></path>
            </svg>
          {/if}
        </span>
        <span class="listen-button__label">
          {generatedAudioSrc ? playbackLabel : (isPlaying ? 'Stop listening' : 'Listen to the story')}
        </span>
      </button>

      <button type="button" class="icon-button icon-button--labelled" onclick={shareStory}>
        <span aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M11.5 4.5L15.5 8.5M15.5 8.5L11.5 12.5M15.5 8.5H7.75C5.68 8.5 4 10.18 4 12.25V15.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>
        <span>Share</span>
      </button>

      <button
        type="button"
        class="icon-button icon-button--labelled"
        onclick={toggleBookmark}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Save this story'}
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M6 3.75H14C14.41 3.75 14.75 4.09 14.75 4.5V16L10 13.1L5.25 16V4.5C5.25 4.09 5.59 3.75 6 3.75Z"
              stroke="currentColor"
              stroke-width="1.5"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>
        <span>Save</span>
      </button>
    </div>
  </div>

  {#if shareFeedback}
    <p class="story-toolbar__feedback" aria-live="polite">{shareFeedback}</p>
  {/if}
</section>

<style>
  .story-toolbar {
    border-top: 1px solid var(--color-line);
    margin: 0 auto;
    max-width: calc(var(--measure-prose) + (var(--gutter) * 2));
    padding: var(--space-3) var(--gutter) var(--space-2);
  }

  .story-toolbar__inner {
    display: block;
    margin: 0 auto;
    max-width: var(--measure-prose);
  }

  .story-toolbar__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: flex-start;
  }

  .listen-button,
  .icon-button {
    align-items: center;
    appearance: none;
    background: transparent;
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    color: var(--color-accent-2);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--font-sans);
    gap: 0.45rem;
    height: 2.5rem;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.5rem 0.8rem;
    transition:
      border-color 120ms ease,
      color 120ms ease,
      background-color 120ms ease;
  }

  .listen-button:hover,
  .listen-button:focus-visible,
  .icon-button:hover,
  .icon-button:focus-visible {
    border-color: var(--color-line-strong);
    color: var(--link-hover);
  }

  .listen-button:disabled {
    color: var(--color-faint);
    cursor: default;
  }

  .listen-button__icon,
  .icon-button > span[aria-hidden='true'] {
    align-items: center;
    display: inline-flex;
    height: 1.25rem;
    justify-content: center;
    width: 1.25rem;
  }

  .listen-button__icon {
    border: 1px solid color-mix(in srgb, var(--color-line-strong) 72%, white);
    border-radius: 999px;
    flex: 0 0 auto;
    height: 1.7rem;
    width: 1.7rem;
  }

  .listen-button__icon svg,
  .icon-button svg {
    display: block;
    height: 100%;
    width: 100%;
  }

  .listen-button__label,
  .icon-button {
    font-size: var(--font-size-small);
    font-weight: 600;
    letter-spacing: 0;
    line-height: 1;
  }

  .icon-button {
    min-width: 2.5rem;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
  }

  .icon-button--labelled {
    gap: 0.4rem;
    padding-left: 0.8rem;
    padding-right: 0.85rem;
  }

  .story-toolbar__feedback {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    margin: 0.35rem 0 0;
  }

  @media (max-width: 700px) {
    .story-toolbar__actions {
      gap: 0.5rem;
    }
  }
</style>
