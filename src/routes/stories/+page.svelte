<script lang="ts">
    import { base } from "$app/paths";
    import { onMount } from "svelte";
    import { readBookmarks } from "$lib/components/story/bookmarks";
    import { stories } from "$lib/content/stories";
    import { plainTextFromHtml } from "$lib/content/text";
    const isVideoHero = (src: string) => src.toLowerCase().endsWith(".mp4");
    const hasHeroMedia = (story: (typeof stories)[number]) =>
        Boolean(story.hero?.src?.trim());
    let bookmarked = $state<Set<string>>(new Set());

    onMount(() => {
        bookmarked = new Set(readBookmarks());
    });
</script>

<svelte:head>
    <title>Inside Parliament</title>
    <meta
        name="description"
        content="Browse our stories from Inside Parliament."
    />
</svelte:head>

<section class="page-shell stories-page">
    <header>
        <p class="eyebrow">Explore</p>
        <h1>Parliament at work</h1>
        <p class="lede">
            There's more to the work of the Houses of Oireachtas. Explore it
            with our explanatory notes and features.
        </p>
    </header>

    <div class="archive-list">
        {#each stories as story}
            <article>
                <a href="{base}/stories/{story.slug}/">
                    {#if hasHeroMedia(story)}
                        {#if isVideoHero(story.hero.src)}
                            <video
                                autoplay
                                muted
                                loop
                                playsinline
                                aria-hidden="true"
                            >
                                <source
                                    src="{base}{story.hero.src}"
                                    type="video/mp4"
                                />
                            </video>
                        {:else}
                            <img
                                src="{base}{story.hero.src}"
                                alt=""
                                loading="lazy"
                            />
                        {/if}
                    {/if}
                    <div>
                        <div class="story-context">
                            <p>{story.eyebrow}</p>
                            {#if bookmarked.has(story.slug)}
                                <span class="saved-chip">Saved</span>
                            {/if}
                        </div>
                        <h2>{story.title}</h2>
                        <span>{plainTextFromHtml(story.dek)}</span>
                        <small>{story.date} · {story.readingTime}</small>
                    </div>
                </a>
            </article>
        {/each}
    </div>
</section>

<style>
    .stories-page {
        padding-top: clamp(var(--space-7), 7vw, 4.75rem);
    }

    header {
        border-bottom: 1px solid
            color-mix(in srgb, var(--color-line) 55%, transparent);
        margin-bottom: var(--space-section);
        padding-bottom: var(--space-6);
    }

    h1 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h1);
        font-weight: var(--font-weight-heading);
        line-height: var(--line-height-heading);
        margin: 0 0 var(--space-stack-tight);
    }

    .archive-list {
        display: grid;
    }

    article a {
        border-bottom: 1px solid var(--color-line);
        display: grid;
        gap: var(--space-5);
        grid-template-columns: minmax(12rem, 0.48fr) minmax(0, 1fr);
        padding: var(--space-5) 0;
        text-decoration: none;
    }

    img,
    video {
        aspect-ratio: 4 / 3;
        border: 1px solid var(--color-line);
        object-fit: cover;
        width: 100%;
    }

    .story-context {
        align-items: baseline;
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem 0.55rem;
        margin-bottom: 0.55rem;
    }

    .story-context p {
        color: var(--color-accent);
        font-size: var(--font-size-small);
        font-weight: var(--font-weight-meta);
        letter-spacing: 0.11em;
        line-height: var(--line-height-small);
        margin: 0;
        text-transform: uppercase;
    }

    .saved-chip {
        -webkit-text-size-adjust: 100%;
        align-self: center;
        border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
        border-radius: 999px;
        color: var(--color-muted);
        display: inline-flex;
        flex: 0 0 auto;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        line-height: 1;
        padding: 0.25rem 0.5rem;
        text-transform: uppercase;
        white-space: nowrap;
    }

    h2 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h3);
        font-weight: var(--font-weight-heading);
        line-height: 1.18;
        margin: 0 0 var(--space-3);
    }

    span {
        color: var(--color-muted);
        display: block;
        font-family: var(--font-sans);
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        max-width: var(--measure-card);
        white-space: pre-line;
    }

    small {
        color: var(--color-muted);
        display: block;
        font-size: var(--font-size-small);
        font-weight: var(--font-weight-meta);
        letter-spacing: 0.07em;
        line-height: var(--line-height-small);
        margin-top: 1.25rem;
        text-transform: uppercase;
    }

    @media (max-width: 760px) {
        article a {
            display: block;
        }

        img {
            margin-bottom: 1rem;
        }
    }
</style>
