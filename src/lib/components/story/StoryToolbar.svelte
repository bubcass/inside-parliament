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

  let {
    story,
    hasContents = false,
    immersive = false
  }: {
    story: Story;
    hasContents?: boolean;
    immersive?: boolean;
  } = $props();

  let isClient = $state(false);
  let isPlaying = $state(false);
  let isBookmarked = $state(false);
  let isLoadingAudio = $state(false);
  let citationCopied = $state(false);
  let shareFeedback = $state('');
  let generatedAudioSrc = $state<string | null>(null);
  let mobileActionsOpen = $state(false);
  let isDarkTheme = $state(false);
  let mobileActionsMenu: HTMLDivElement | undefined = $state();
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

    return isPlaying ? 'Stop listening' : 'Listen to the article';
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

  function clearCitationSoon() {
    window.setTimeout(() => {
      citationCopied = false;
    }, 1800);
  }

  function toggleTheme() {
    window.dispatchEvent(new Event('inside-parliament:toggle-theme'));
  }

  function citationUrl() {
    if (!isClient) return `${base}/stories/${story.slug}/`;

    const url = new URL(window.location.href);
    url.hash = '';
    return url.toString();
  }

  function articleCitation() {
    const selectedAuthors = story.authors
      ?.map((author) => plainText(author.name ?? ''))
      .filter(Boolean)
      .slice(0, 3) ?? [];
    const author = selectedAuthors.join(', ')
      || plainText(story.researcher?.name ?? story.byline)
      || 'Houses of the Oireachtas';
    const title = plainText(story.title);
    return `${author}. “${title}.” Inside Parliament, Houses of the Oireachtas, ${story.date}, ${citationUrl()}.`;
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

  function printArticle() {
    if (!isClient) return;
    window.print();
  }

  async function copyCitation() {
    if (!isClient || !navigator.clipboard?.writeText) return;

    await navigator.clipboard.writeText(articleCitation());
    citationCopied = true;
    shareFeedback = 'Citation copied';
    clearFeedbackSoon();
    clearCitationSoon();
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

  function closeMobileActionsOnOutsideClick(event: PointerEvent) {
    if (
      mobileActionsOpen &&
      mobileActionsMenu &&
      !mobileActionsMenu.contains(event.target as Node)
    ) {
      mobileActionsOpen = false;
    }
  }

  function closeMobileActionsOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') mobileActionsOpen = false;
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
    isDarkTheme = document.documentElement.dataset.theme === 'dark';
    const syncTheme = (event: Event) => {
      isDarkTheme = (event as CustomEvent<'light' | 'dark'>).detail === 'dark';
    };
    const handleArticleAction = (event: Event) => {
      switch ((event as CustomEvent<string>).detail) {
        case 'listen': togglePlayback(); break;
        case 'share': void shareStory(); break;
        case 'save': toggleBookmark(); break;
        case 'cite': void copyCitation(); break;
        case 'print': printArticle(); break;
      }
    };
    window.addEventListener('pointerdown', closeMobileActionsOnOutsideClick);
    window.addEventListener('keydown', closeMobileActionsOnEscape);
    window.addEventListener('inside-parliament:theme-changed', syncTheme);
    window.addEventListener('article-action', handleArticleAction);
    void loadGeneratedAudio();

    return () => {
      window.removeEventListener('inside-parliament:theme-changed', syncTheme);
      window.removeEventListener('article-action', handleArticleAction);
    };
  });

  onDestroy(() => {
    if (isClient) {
      window.removeEventListener('pointerdown', closeMobileActionsOnOutsideClick);
      window.removeEventListener('keydown', closeMobileActionsOnEscape);
    }
    stopAllPlayback();
    clearMediaSession();
    audio = null;
  });
</script>

<section
  class="story-toolbar"
  class:with-contents={hasContents}
  class:is-immersive={immersive}
  aria-label="Article actions"
>
  <div class="story-toolbar__inner">
    <div class="story-toolbar__actions">
      <button
        type="button"
        class="listen-button"
        onclick={togglePlayback}
        aria-pressed={isPlaying}
        aria-label={generatedAudioSrc ? playbackLabel : (isPlaying ? 'Stop listening to the article' : 'Listen to the article')}
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
          {generatedAudioSrc ? playbackLabel : (isPlaying ? 'Stop listening' : 'Listen to the article')}
        </span>
      </button>

      <button
        type="button"
        class="icon-button icon-button--labelled"
        onclick={shareStory}
        aria-label="Share this article"
      >
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
        aria-label={isBookmarked ? 'Remove saved article' : 'Save this article'}
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
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>

      <button
        type="button"
        class="icon-button icon-button--labelled"
        class:is-success={citationCopied}
        onclick={copyCitation}
        aria-label="Copy article citation"
      >
        <span aria-hidden="true">
          {#if citationCopied}
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M4.75 10.5L8.25 14L15.25 7"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          {:else}
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="5.5" y="5.25" width="9.5" height="11.5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
              <path d="M8 5.25V4.75C8 3.92 8.67 3.25 9.5 3.25H11.5C12.33 3.25 13 3.92 13 4.75V5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
          {/if}
        </span>
        <span>{citationCopied ? 'Citation copied' : 'Cite this article'}</span>
      </button>

      <button
        type="button"
        class="icon-button icon-button--labelled"
        onclick={printArticle}
        aria-label="Print this article"
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6.25V4.75C6 4.34 6.34 4 6.75 4H13.25C13.66 4 14 4.34 14 4.75V6.25M6.25 11.75H13.75M7 14.25H13M5.5 8H14.5C15.33 8 16 8.67 16 9.5V13.5C16 14.33 15.33 15 14.5 15H5.5C4.67 15 4 14.33 4 13.5V9.5C4 8.67 4.67 8 5.5 8Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </span>
        <span>Print</span>
      </button>

      <button
        type="button"
        class="icon-button icon-button--utility"
        onclick={toggleTheme}
        aria-label={`Use ${isDarkTheme ? 'light' : 'dark'} mode`}
        title={isDarkTheme ? 'Light mode' : 'Dark mode'}
      >
        <span aria-hidden="true">
          {#if isDarkTheme}
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3.1" stroke="currentColor" stroke-width="1.5"></circle>
              <path d="M10 2.5V4M10 16V17.5M17.5 10H16M4 10H2.5M15.3 4.7L14.25 5.75M5.75 14.25L4.7 15.3M15.3 15.3L14.25 14.25M5.75 5.75L4.7 4.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
          {:else}
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M16.6 12.75A7.1 7.1 0 0 1 7.25 3.4a7.1 7.1 0 1 0 9.35 9.35Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          {/if}
        </span>
      </button>
    </div>
  </div>

  {#if shareFeedback}
    <p class="story-toolbar__feedback" aria-live="polite">{shareFeedback}</p>
  {/if}
</section>

<div class="mobile-story-actions" bind:this={mobileActionsMenu}>
    <button
      class="mobile-story-actions__toggle"
      type="button"
      aria-label="More story actions"
      aria-expanded={mobileActionsOpen}
      aria-controls="mobile-story-actions-menu"
      onclick={() => (mobileActionsOpen = !mobileActionsOpen)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5" cy="12" r="1.8"></circle>
        <circle cx="12" cy="12" r="1.8"></circle>
        <circle cx="19" cy="12" r="1.8"></circle>
      </svg>
    </button>

    {#if mobileActionsOpen}
      <div id="mobile-story-actions-menu" class="mobile-story-actions__menu">
        <button
          type="button"
          onclick={() => {
            togglePlayback();
            mobileActionsOpen = false;
          }}
          aria-pressed={isPlaying}
          disabled={!generatedAudioSrc && !storyAudioText}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            {#if isPlaying}
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
          <span>{generatedAudioSrc ? playbackLabel : (isPlaying ? 'Stop listening' : 'Listen to article')}</span>
        </button>
        <button
          type="button"
          onclick={() => {
            void shareStory();
            mobileActionsOpen = false;
          }}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M11.5 4.5L15.5 8.5M15.5 8.5L11.5 12.5M15.5 8.5H7.75C5.68 8.5 4 10.18 4 12.25V15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
          <span>Share article</span>
        </button>
        <button
          type="button"
          aria-pressed={isBookmarked}
          onclick={() => {
            toggleBookmark();
            mobileActionsOpen = false;
          }}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M6 3.75H14C14.41 3.75 14.75 4.09 14.75 4.5V16L10 13.1L5.25 16V4.5C5.25 4.09 5.59 3.75 6 3.75Z" stroke="currentColor" stroke-width="1.5" fill={isBookmarked ? 'currentColor' : 'none'} stroke-linejoin="round"></path>
            </svg>
          </span>
          <span>{isBookmarked ? 'Remove from saved' : 'Save article'}</span>
        </button>
        <button
          type="button"
          onclick={() => {
            void copyCitation();
            mobileActionsOpen = false;
          }}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="5.5" y="5.25" width="9.5" height="11.5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
              <path d="M8 5.25V4.75C8 3.92 8.67 3.25 9.5 3.25H11.5C12.33 3.25 13 3.92 13 4.75V5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
          </span>
          <span>Copy citation</span>
        </button>
        <button
          type="button"
          onclick={() => {
            printArticle();
            mobileActionsOpen = false;
          }}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M6 6.25V4.75C6 4.34 6.34 4 6.75 4H13.25C13.66 4 14 4.34 14 4.75V6.25M6.25 11.75H13.75M7 14.25H13M5.5 8H14.5C15.33 8 16 8.67 16 9.5V13.5C16 14.33 15.33 15 14.5 15H5.5C4.67 15 4 14.33 4 13.5V9.5C4 8.67 4.67 8 5.5 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
          <span>Print article</span>
        </button>
        <button
          type="button"
          onclick={() => {
            toggleTheme();
            mobileActionsOpen = false;
          }}
        >
          <span aria-hidden="true" class="mobile-action-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M16.6 12.75A7.1 7.1 0 0 1 7.25 3.4a7.1 7.1 0 1 0 9.35 9.35Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
          <span>{isDarkTheme ? 'Light mode' : 'Dark mode'}</span>
        </button>
        {#if shareFeedback}
          <p aria-live="polite">{shareFeedback}</p>
        {/if}
      </div>
    {/if}
</div>

<style>
  .story-toolbar {
    border-top: 1px solid color-mix(in srgb, var(--color-line) 68%, transparent);
    margin: 0 auto;
    max-width: calc(var(--measure-prose) + (var(--gutter) * 2));
    padding: var(--space-4) var(--gutter) var(--space-6);
  }

  .story-toolbar.is-immersive {
    padding-bottom: var(--space-7);
    padding-top: clamp(var(--space-5), 2vw, var(--space-6));
  }

  .story-toolbar.with-contents {
    max-width: calc(var(--wide) + (var(--gutter) * 2));
  }

  .story-toolbar__inner {
    display: block;
    margin: 0 auto;
    max-width: var(--measure-prose);
  }

  .story-toolbar.with-contents .story-toolbar__inner {
    display: grid;
    gap: clamp(var(--space-6), 5vw, var(--space-8));
    grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
    max-width: none;
  }

  .story-toolbar.with-contents .story-toolbar__actions {
    grid-column: 2;
    margin: 0 auto;
    max-width: var(--measure-prose);
  }

  .story-toolbar__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: flex-start;
    width: 100%;
  }

  .listen-button,
  .icon-button {
    align-items: center;
    appearance: none;
    background: transparent;
    border: 1px solid var(--color-line);
    border-radius: 2px;
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

  .listen-button {
    margin-right: auto;
  }

  .icon-button.is-success {
    background: color-mix(in srgb, var(--color-soft) 78%, transparent);
    border-color: color-mix(in srgb, var(--color-accent) 28%, var(--color-line));
    color: var(--color-accent);
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

  .mobile-story-actions {
    display: none;
  }

  @media (max-width: 860px) {
    .story-toolbar,
    .story-toolbar.is-immersive {
      display: none;
    }

    .story-toolbar.with-contents .story-toolbar__inner {
      display: block;
      max-width: var(--measure-prose);
    }

    .story-toolbar.with-contents .story-toolbar__actions {
      grid-column: auto;
      max-width: none;
    }

    .story-toolbar__actions {
      gap: 0.5rem;
    }

  .mobile-story-actions {
      display: none;
      pointer-events: auto;
      position: fixed;
      right: max(12px, env(safe-area-inset-right));
      top: max(12px, env(safe-area-inset-top));
      z-index: 31;
    }

    .mobile-story-actions__toggle {
      appearance: none;
      background: color-mix(in srgb, var(--color-panel) 82%, transparent);
      backdrop-filter: blur(18px) saturate(125%);
      -webkit-backdrop-filter: blur(18px) saturate(125%);
      border: 1px solid color-mix(in srgb, var(--color-line) 82%, transparent);
      border-radius: 999px;
      box-shadow: 0 5px 20px rgba(32, 31, 28, 0.14);
      color: var(--color-ink);
      cursor: pointer;
      display: grid;
      height: 46px;
      padding: 0;
      place-items: center;
      width: 46px;
    }

    .mobile-story-actions__toggle svg {
      fill: currentColor;
      height: 23px;
      width: 23px;
    }

    .mobile-story-actions__menu {
      background: var(--color-surface-glass);
      backdrop-filter: blur(22px) saturate(125%);
      -webkit-backdrop-filter: blur(22px) saturate(125%);
      border: 1px solid var(--color-line);
      border-radius: 3px;
      box-shadow: 0 14px 38px rgba(32, 31, 28, 0.2);
      padding: 0.4rem;
      position: absolute;
      right: 0;
      top: calc(100% + 0.5rem);
      width: min(13.5rem, calc(100vw - 1.5rem));
    }

    .mobile-story-actions__menu button {
      align-items: center;
      appearance: none;
      background: transparent;
      border: 0;
      border-radius: 2px;
      color: var(--color-ink);
      cursor: pointer;
      display: flex;
      font: inherit;
      font-size: 0.9rem;
      gap: 0.65rem;
      min-height: 44px;
      padding: 0.55rem 0.7rem;
      text-align: left;
      width: 100%;
    }

    .mobile-story-actions__menu button:hover,
    .mobile-story-actions__menu button:focus-visible {
      background: color-mix(in srgb, var(--color-soft) 72%, transparent);
    }

    .mobile-story-actions__menu button:disabled {
      color: var(--color-faint);
      cursor: default;
    }

    .mobile-story-actions__menu button > span:first-child {
      display: inline-grid;
      flex: 0 0 1.25rem;
      place-items: center;
      width: 1.25rem;
    }

    .mobile-action-icon svg {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
    }

    .mobile-story-actions__menu p {
      color: var(--color-muted);
      font-size: var(--font-size-small);
      margin: 0;
      padding: 0.4rem 0.7rem;
    }
  }

  @media (max-width: 700px) {
    .story-toolbar__actions {
      flex-wrap: nowrap;
      justify-content: space-between;
    }

    .listen-button,
    .icon-button--labelled {
      height: 2.75rem;
      margin-right: 0;
      min-height: 2.75rem;
      min-width: 2.75rem;
      padding: 0;
      width: 2.75rem;
    }

    .listen-button__label,
    .icon-button--labelled > span:last-child {
      display: none;
    }
  }

  @media print {
    .story-toolbar,
    .mobile-story-actions {
      display: none !important;
    }
  }
</style>
