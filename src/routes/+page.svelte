<script lang="ts">
    import { base } from "$app/paths";
    import type { Story } from "$lib/content/types";
    import { stories } from "$lib/content/stories";
    import { plainTextFromHtml } from "$lib/content/text";

    const featuredStory = stories.find((story) => story.featured) ?? stories[0];
    const secondaryStories = featuredStory
        ? stories.filter((story) => story.slug !== featuredStory.slug)
        : stories;
</script>

<svelte:head>
    <title>Inside Parliament | Get to know the Houses of the Oireachtas</title>
    <meta
        name="description"
        content="SvelteKit static site prototype for longform editorial media stories."
    />
</svelte:head>

<section class="home-hero page-shell">
    <div>
        <p class="eyebrow">See for yourself</p>
        <h1>Inside Parliament</h1>
    </div>
    <p class="lede">
        Get to know the work of the Houses of the Oireachtas with our news
        updates, explainers and in-depth features of how your Parliament works.
    </p>
</section>

<section class="story-index page-shell">
    {#if featuredStory}
        <article class="featured-story">
            <a href="{base}/stories/{featuredStory.slug}/">
                <div class="featured-copy">
                    <div class="story-context">
                        <p>{featuredStory.eyebrow}</p>
                    </div>
                    <h3>{featuredStory.title}</h3>
                    <span class="featured-summary">
                        {plainTextFromHtml(featuredStory.dek)}
                    </span>
                    <small>{featuredStory.date} · {featuredStory.readingTime}</small>
                </div>
                <img
                    src="{base}{featuredStory.hero.src}"
                    alt=""
                    loading="eager"
                />
            </a>
        </article>
    {/if}

    <div class="secondary-grid">
        {#each secondaryStories as story}
            <article class="secondary-story">
                <a href="{base}/stories/{story.slug}/">
                    <img src="{base}{story.hero.src}" alt="" loading="lazy" />
                    <div class="secondary-copy">
                        <div class="story-context">
                            <p>{story.eyebrow}</p>
                        </div>
                        <h3>{story.title}</h3>
                        <span>{plainTextFromHtml(story.dek)}</span>
                        <small>{story.date} · {story.readingTime}</small>
                    </div>
                </a>
            </article>
        {/each}
    </div>
</section>

<style>
    .home-hero {
        align-items: end;
        border-bottom: 1px solid color-mix(in srgb, var(--color-line) 55%, transparent);
        display: grid;
        gap: var(--space-6);
        grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
        min-height: 0;
        padding-bottom: var(--space-8);
        padding-top: clamp(var(--space-8), 8vw, 5rem);
    }

    h1 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h1);
        font-weight: var(--font-weight-heading);
        letter-spacing: 0;
        line-height: var(--line-height-heading);
        margin: 0;
        max-width: 14ch;
        text-wrap: balance;
    }

    .story-index {
        padding-top: var(--space-8);
    }

    .featured-story {
        margin-bottom: clamp(var(--space-7), 4vw, 3.25rem);
    }

    .featured-story a {
        border-bottom: 1px solid color-mix(in srgb, var(--color-line) 62%, transparent);
        display: grid;
        gap: clamp(var(--space-6), 4vw, var(--space-8));
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
        padding-bottom: var(--space-7);
        text-decoration: none;
    }

    .featured-copy {
        align-self: center;
        max-width: var(--measure-card);
    }

    .story-context {
        align-items: baseline;
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem 0.55rem;
        margin-bottom: var(--space-3);
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

    .featured-story h3 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: clamp(1.7rem, 2.85vw, 2.35rem);
        font-weight: var(--font-weight-heading);
        line-height: 1.08;
        margin: 0 0 var(--space-4);
        max-width: 13ch;
        text-wrap: balance;
    }

    .featured-summary {
        color: var(--color-muted);
        display: block;
        font-family: var(--font-sans);
        font-size: var(--font-size-body);
        line-height: var(--line-height-body);
        max-width: var(--measure-card);
        white-space: pre-line;
    }

    .featured-story img {
        aspect-ratio: 16 / 11;
        background: var(--color-soft);
        max-height: min(31rem, 58vh);
        object-fit: cover;
        width: 100%;
    }

    .secondary-grid {
        display: grid;
        gap: clamp(var(--space-6), 3vw, var(--space-7));
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .secondary-story a {
        display: grid;
        gap: var(--space-4);
        text-decoration: none;
    }

    .secondary-story img {
        aspect-ratio: 4 / 3;
        background: var(--color-soft);
        object-fit: cover;
        width: 100%;
    }

    .secondary-copy {
        max-width: var(--measure-card);
    }

    .secondary-story h3 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h3);
        font-weight: var(--font-weight-heading);
        line-height: 1.18;
        margin: 0 0 var(--space-3);
        max-width: 18ch;
        text-wrap: balance;
    }

    .secondary-story span {
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

    @media (max-width: 900px) {
        .featured-story a {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    @media (max-width: 760px) {
        .home-hero {
            display: block;
        }

        .home-hero .lede {
            margin-top: 1.5rem;
        }

        .featured-story a {
            gap: var(--space-5);
            padding-bottom: var(--space-6);
        }

        .featured-story h3 {
            font-size: clamp(1.55rem, 8vw, 2.2rem);
            max-width: 12ch;
        }

        .featured-story img {
            aspect-ratio: 4 / 3;
            max-height: 22rem;
        }

        .secondary-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
</style>
