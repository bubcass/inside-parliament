<script lang="ts">
    import { base } from "$app/paths";
    import { onDestroy, onMount } from "svelte";
    import type { ShortVideoItem } from "$lib/content/shorts";
    import { shareVideoAsset } from "$lib/components/story/videoShare";

    interface Props {
        items: ShortVideoItem[];
    }

    let { items }: Props = $props();

    let track = $state<HTMLDivElement | null>(null);
    let viewerIndex = $state<number | null>(null);
    let hoverIndex = $state<number | null>(null);
    let canPrev = $state(false);
    let canNext = $state(true);
    let activeVideo: HTMLVideoElement | null = null;
    let viewerVideo = $state<HTMLVideoElement | null>(null);
    let touchStartY = $state<number | null>(null);
    let showSwipeHint = $state(false);
    let viewerMuted = $state(true);
    let shareFeedback = $state("");
    let swipeHintTimer: ReturnType<typeof setTimeout> | null = null;

    const cardVideos: Array<HTMLVideoElement | null> = [];
    const gapPx = 18;
    const swipeThreshold = 48;

    function updateScrollState() {
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        canPrev = track.scrollLeft > 2;
        canNext = track.scrollLeft < maxScroll - 2;
    }

    function scrollByDir(direction: -1 | 1) {
        if (!track) return;
        const firstCard = track.querySelector<HTMLElement>(".short-card");
        const cardWidth = firstCard
            ? firstCard.getBoundingClientRect().width + gapPx
            : track.clientWidth * 0.82;

        track.scrollBy({
            left: direction * cardWidth,
            behavior: "smooth",
        });
    }

    async function startTeaser(index: number) {
        if (viewerIndex !== null) return;

        if (activeVideo && activeVideo !== cardVideos[index]) {
            activeVideo.pause();
            activeVideo.currentTime = 0;
        }

        hoverIndex = index;

        const video = cardVideos[index];
        if (!video) return;

        activeVideo = video;
        video.currentTime = 0;

        try {
            await video.play();
        } catch {
            // Hover autoplay can be blocked; the poster still provides the cue.
        }
    }

    function stopTeaser(index: number) {
        const video = cardVideos[index];
        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        if (activeVideo === video) {
            activeVideo = null;
        }

        if (hoverIndex === index) {
            hoverIndex = null;
        }
    }

    function openViewer(index: number) {
        stopTeaser(index);
        viewerIndex = index;
        viewerMuted = true;
        showSwipeHint = true;

        if (swipeHintTimer) {
            clearTimeout(swipeHintTimer);
        }

        swipeHintTimer = setTimeout(() => {
            showSwipeHint = false;
        }, 2200);
    }

    function closeViewer() {
        viewerIndex = null;
        showSwipeHint = false;
        shareFeedback = "";
        if (viewerVideo) {
            viewerVideo.pause();
            viewerVideo.currentTime = 0;
        }
    }

    function setViewerIndex(nextIndex: number) {
        if (nextIndex < 0 || nextIndex >= items.length) return;
        viewerIndex = nextIndex;
        viewerMuted = true;
    }

    function toggleViewerSound() {
        if (!viewerVideo) return;
        viewerVideo.muted = !viewerVideo.muted;
        viewerMuted = viewerVideo.muted;
    }

    async function shareViewerVideo() {
        if (viewerIndex === null) return;
        const item = items[viewerIndex];
        const result = await shareVideoAsset({
            src: item.src,
            title: item.title,
        });

        if (result === "copied") {
            shareFeedback = "Link copied";
            window.setTimeout(() => (shareFeedback = ""), 1800);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (viewerIndex === null) return;

        if (event.key === "Escape") {
            closeViewer();
        } else if (event.key === "ArrowRight") {
            setViewerIndex(viewerIndex + 1);
        } else if (event.key === "ArrowLeft") {
            setViewerIndex(viewerIndex - 1);
        } else if (event.key === "ArrowDown") {
            setViewerIndex(viewerIndex + 1);
        } else if (event.key === "ArrowUp") {
            setViewerIndex(viewerIndex - 1);
        }
    }

    function handleViewerTouchStart(event: TouchEvent) {
        touchStartY = event.touches[0]?.clientY ?? null;
    }

    function handleViewerTouchEnd(event: TouchEvent) {
        if (touchStartY === null || viewerIndex === null) return;

        const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
        const deltaY = touchEndY - touchStartY;

        if (deltaY <= -swipeThreshold) {
            setViewerIndex(viewerIndex + 1);
        } else if (deltaY >= swipeThreshold) {
            setViewerIndex(viewerIndex - 1);
        }

        touchStartY = null;
    }

    onMount(() => {
        updateScrollState();

        if (!track) return;

        const onScroll = () => updateScrollState();
        track.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            track?.removeEventListener("scroll", onScroll);
        };
    });

    onDestroy(() => {
        if (swipeHintTimer) {
            clearTimeout(swipeHintTimer);
        }
    });
</script>

<svelte:window onkeydown={handleKeydown} onresize={updateScrollState} />

{#if items.length}
    <section
        class="shorts-section"
        aria-labelledby="inside-parliament-shorts-heading"
    >
        <div class="shorts-header">
            <div>
                <p class="eyebrow">Watch</p>
                <h2 id="inside-parliament-shorts-heading">Latest videos</h2>
            </div>
        </div>

        <div class="shorts-body">
            <button
                type="button"
                class="shorts-arrow shorts-arrow-left"
                aria-label="Scroll short videos left"
                disabled={!canPrev}
                onclick={() => scrollByDir(-1)}
            >
                ‹
            </button>

            <div
                class="shorts-strip"
                bind:this={track}
                aria-label="Short video highlights"
                role="list"
            >
                {#each items as item, index}
                    <article class="short-card" role="listitem">
                        <button
                            type="button"
                            class="short-media"
                            onmouseenter={() => startTeaser(index)}
                            onmouseleave={() => stopTeaser(index)}
                            onfocus={() => startTeaser(index)}
                            onblur={() => stopTeaser(index)}
                            onclick={() => openViewer(index)}
                            aria-label={`Open video: ${item.title}`}
                        >
                            <img
                                src={base + item.poster}
                                alt=""
                                loading="lazy"
                                class="short-poster"
                            />

                            <video
                                bind:this={cardVideos[index]}
                                class:short-video--visible={hoverIndex ===
                                    index}
                                class="short-video"
                                muted
                                playsinline
                                preload="metadata"
                                src={base + item.src}
                            ></video>

                            <div class="short-gradient"></div>

                            <div class="short-copy">
                                <strong>{item.title}</strong>
                                <span class="short-meta">{item.date}</span>
                            </div>

                            <span class="short-play">▶</span>
                        </button>
                    </article>
                {/each}
            </div>

            <button
                type="button"
                class="shorts-arrow shorts-arrow-right"
                aria-label="Scroll short videos right"
                disabled={!canNext}
                onclick={() => scrollByDir(1)}
            >
                ›
            </button>
        </div>
    </section>
{/if}

{#if viewerIndex !== null}
    {@const item = items[viewerIndex]}
    <div
        class="viewer-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shorts-viewer-title"
        tabindex="-1"
        onclick={(event) => {
            if (event.currentTarget === event.target) closeViewer();
        }}
        onkeydown={handleKeydown}
    >
        <div class="viewer-shell">
            <div class="viewer-header">
                <div class="viewer-heading">
                    <span>{item.eyebrow}</span>
                    <h3 id="shorts-viewer-title">{item.title}</h3>
                    <p>{item.date}</p>
                </div>
                <button
                    type="button"
                    class="viewer-close"
                    onclick={closeViewer}
                    aria-label="Close video viewer"
                >
                    ✕
                </button>
            </div>

            <div class="viewer-body">
                <button
                    type="button"
                    class="viewer-nav"
                    aria-label="Previous video"
                    disabled={viewerIndex === 0}
                    onclick={() => setViewerIndex((viewerIndex ?? 0) - 1)}
                >
                    ‹
                </button>

                <div
                    class="viewer-stage"
                    role="group"
                    aria-label="Video player area"
                    ontouchstart={handleViewerTouchStart}
                    ontouchend={handleViewerTouchEnd}
                >
                    <div class:viewer-swipe-hint--hidden={!showSwipeHint} class="viewer-swipe-hint">
                        Swipe up for next video
                    </div>

                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video
                        bind:this={viewerVideo}
                        src={base + item.src}
                        poster={base + item.poster}
                        muted={viewerMuted}
                        playsinline
                        autoplay
                    ></video>

                    <div class="viewer-video-actions" aria-label="Video controls">
                        <button
                            type="button"
                            class="viewer-video-action"
                            onclick={toggleViewerSound}
                            aria-label={viewerMuted ? "Turn sound on" : "Mute video"}
                            aria-pressed={!viewerMuted}
                        >
                            {#if viewerMuted}
                                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5 2 3 3m0-3-3 3" /></svg>
                            {:else}
                                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5-3.5a5 5 0 0 1 0 7m2-10a9 9 0 0 1 0 13" /></svg>
                            {/if}
                        </button>
                        <button
                            type="button"
                            class="viewer-video-action"
                            onclick={shareViewerVideo}
                            aria-label="Share video"
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V3m0 0-4 4m4-4 4 4M5 10v9h14v-9" /></svg>
                        </button>
                    </div>
                    {#if shareFeedback}
                        <span class="viewer-share-feedback" role="status">{shareFeedback}</span>
                    {/if}

                    <a class="viewer-link" href="{base}/stories/{item.slug}/">
                        Read the full story
                    </a>
                </div>

                <button
                    type="button"
                    class="viewer-nav"
                    aria-label="Next video"
                    disabled={viewerIndex === items.length - 1}
                    onclick={() => setViewerIndex((viewerIndex ?? 0) + 1)}
                >
                    ›
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .shorts-section {
        border-bottom: 1px solid
            color-mix(in srgb, var(--color-line) 62%, transparent);
        margin: clamp(var(--space-7), 5vw, 3.5rem) 0;
        padding-bottom: clamp(var(--space-7), 5vw, 3.25rem);
    }

    .shorts-header {
        align-items: end;
        display: grid;
        gap: var(--space-5);
        grid-template-columns: minmax(0, 1fr) minmax(18rem, 28rem);
        margin-bottom: var(--space-6);
    }

    .shorts-header h2 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: clamp(1.18rem, 1.55vw, 1.42rem);
        font-weight: var(--font-weight-heading);
        line-height: 1.16;
        margin: 0;
        max-width: 18ch;
        text-wrap: balance;
    }

    .shorts-body {
        position: relative;
    }

    .shorts-strip {
        display: flex;
        gap: 18px;
        overflow-x: auto;
        padding: 0.2rem 0;
        scrollbar-width: none;
        scroll-behavior: smooth;
    }

    .shorts-strip::-webkit-scrollbar {
        display: none;
    }

    .short-card {
        flex: 0 0 auto;
        width: clamp(13rem, 20vw, 15rem);
    }

    .short-media {
        background: #000;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: block;
        overflow: hidden;
        padding: 0;
        position: relative;
        text-align: left;
        width: 100%;
    }

    .short-poster,
    .short-video {
        aspect-ratio: 4 / 7;
        display: block;
        height: auto;
        object-fit: cover;
        width: 100%;
    }

    .short-video {
        inset: 0;
        opacity: 0;
        position: absolute;
        transition: opacity 180ms ease;
    }

    .short-video--visible {
        opacity: 1;
    }

    .short-gradient {
        background: linear-gradient(
            180deg,
            rgba(22, 19, 13, 0.02) 0%,
            rgba(22, 19, 13, 0.2) 44%,
            rgba(22, 19, 13, 0.86) 100%
        );
        inset: 0;
        pointer-events: none;
        position: absolute;
    }

    .short-copy {
        bottom: 0;
        color: white;
        display: grid;
        gap: 0.35rem;
        left: 0;
        padding: 0.95rem;
        position: absolute;
        right: 0;
        z-index: 1;
    }

    .short-copy strong {
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.15;
        max-width: 13ch;
        text-wrap: balance;
    }

    .short-meta {
        color: rgba(255, 253, 247, 0.84);
        font-size: 0.8rem;
        line-height: 1.3;
    }

    .short-play {
        align-items: center;
        backdrop-filter: blur(3px);
        background: rgba(255, 253, 247, 0.08);
        border: 1px solid rgba(255, 253, 247, 0.4);
        border-radius: 999px;
        color: white;
        display: inline-flex;
        font-size: 1.2rem;
        height: 3.6rem;
        justify-content: center;
        line-height: 1;
        pointer-events: none;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 3.6rem;
        z-index: 1;
    }

    .shorts-arrow {
        align-items: center;
        background: color-mix(in srgb, white 92%, var(--color-soft));
        border: 1px solid
            color-mix(in srgb, var(--color-line-strong) 55%, transparent);
        border-radius: 999px;
        color: var(--color-accent-2);
        cursor: pointer;
        display: inline-flex;
        font-size: 1.5rem;
        height: 2.4rem;
        justify-content: center;
        position: absolute;
        top: calc(50% - 1.2rem);
        transition:
            transform 140ms ease,
            background 140ms ease;
        width: 2.4rem;
        z-index: 2;
    }

    .shorts-arrow:hover:not(:disabled) {
        background: white;
        transform: translateY(-1px);
    }

    .shorts-arrow:disabled {
        cursor: default;
        opacity: 0.38;
        transform: none;
    }

    .shorts-arrow-left {
        left: -1.1rem;
    }

    .shorts-arrow-right {
        right: -1.1rem;
    }

    .viewer-backdrop {
        align-items: center;
        background: rgba(18, 16, 12, 0.82);
        display: flex;
        inset: 0;
        justify-content: center;
        padding: var(--space-4);
        position: fixed;
        z-index: 100;
    }

    .viewer-shell {
        background: #17130d;
        border: 1px solid rgba(255, 253, 247, 0.08);
        border-radius: 8px;
        color: white;
        max-width: 40rem;
        overflow: hidden;
        width: min(94vw, 40rem);
    }

    .viewer-header {
        align-items: start;
        display: flex;
        gap: var(--space-4);
        justify-content: space-between;
        padding: var(--space-5);
    }

    .viewer-heading span,
    .viewer-heading p {
        color: rgba(255, 253, 247, 0.74);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        margin: 0;
        text-transform: uppercase;
    }

    .viewer-heading h3 {
        font-size: clamp(1.35rem, 2.4vw, 1.85rem);
        line-height: 1.08;
        margin: 0.35rem 0 0.45rem;
        max-width: 16ch;
        text-wrap: balance;
    }

    .viewer-close,
    .viewer-nav {
        align-items: center;
        background: rgba(255, 253, 247, 0.08);
        border: 1px solid rgba(255, 253, 247, 0.18);
        border-radius: 999px;
        color: white;
        cursor: pointer;
        display: inline-flex;
        height: 2.4rem;
        justify-content: center;
        width: 2.4rem;
    }

    .viewer-body {
        align-items: center;
        display: grid;
        gap: var(--space-4);
        grid-template-columns: auto minmax(0, 1fr) auto;
        padding: 0 var(--space-5) var(--space-5);
    }

    .viewer-nav:disabled {
        cursor: default;
        opacity: 0.3;
    }

    .viewer-stage {
        display: grid;
        gap: var(--space-4);
        justify-items: center;
        position: relative;
    }

    .viewer-stage video {
        aspect-ratio: 9 / 16;
        background: black;
        border-radius: 4px;
        max-height: min(78vh, 46rem);
        max-width: 100%;
        object-fit: contain;
        width: min(100%, 24rem);
    }

    .viewer-video-actions {
        display: grid;
        gap: 0.7rem;
        position: absolute;
        right: max(0.75rem, calc((100% - min(100%, 24rem)) / 2 + 0.75rem));
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
    }

    .viewer-video-action {
        align-items: center;
        backdrop-filter: blur(8px);
        background: rgba(16, 15, 12, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.48);
        border-radius: 999px;
        color: white;
        cursor: pointer;
        display: inline-flex;
        font-size: 1.3rem;
        height: 2.8rem;
        justify-content: center;
        line-height: 1;
        padding: 0;
        width: 2.8rem;
    }

    .viewer-video-action:hover,
    .viewer-video-action:focus-visible {
        background: rgba(16, 15, 12, 0.82);
        outline: 2px solid white;
        outline-offset: 2px;
    }

    .viewer-video-action svg {
        fill: none;
        height: 1.55rem;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
        width: 1.55rem;
    }

    .viewer-share-feedback {
        background: rgba(16, 15, 12, 0.82);
        border-radius: 999px;
        bottom: 0.8rem;
        color: white;
        font-size: 0.76rem;
        font-weight: 600;
        padding: 0.35rem 0.6rem;
        position: absolute;
        right: 0.75rem;
        z-index: 2;
    }

    .viewer-swipe-hint {
        backdrop-filter: blur(8px);
        background: rgba(255, 253, 247, 0.1);
        border: 1px solid rgba(255, 253, 247, 0.16);
        border-radius: 999px;
        color: rgba(255, 253, 247, 0.92);
        font-size: 0.75rem;
        font-weight: 600;
        left: 50%;
        letter-spacing: 0.08em;
        padding: 0.5rem 0.8rem;
        pointer-events: none;
        position: absolute;
        text-transform: uppercase;
        top: 0.85rem;
        transform: translateX(-50%);
        transition:
            opacity 260ms ease,
            transform 260ms ease;
        white-space: nowrap;
        z-index: 2;
    }

    .viewer-swipe-hint--hidden {
        opacity: 0;
        transform: translateX(-50%) translateY(-0.35rem);
    }

    .viewer-link {
        color: #f0dca3;
        font-size: 0.92rem;
        font-weight: 600;
        justify-self: start;
        letter-spacing: 0.03em;
    }

    @media (max-width: 900px) {
        .shorts-header {
            grid-template-columns: minmax(0, 1fr);
        }

        .shorts-arrow-left {
            left: -0.55rem;
        }

        .shorts-arrow-right {
            right: -0.55rem;
        }
    }

    @media (max-width: 760px) {
        .viewer-shell {
            width: min(100vw, 32rem);
        }

        .short-card {
            width: min(61vw, 15rem);
        }

        .shorts-arrow {
            display: none;
        }

        .viewer-body {
            grid-template-columns: 1fr;
            padding: 0 var(--space-4) var(--space-4);
        }

        .viewer-nav {
            display: none;
        }

        .viewer-stage video {
            max-height: min(72vh, 42rem);
            width: min(100%, 22rem);
        }
    }

    @media (min-width: 761px) {
        .viewer-swipe-hint {
            display: none;
        }
    }
</style>
