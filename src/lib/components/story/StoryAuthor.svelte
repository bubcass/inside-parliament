<script lang="ts">
  import { base } from '$app/paths';
  import type { Story } from '$lib/content/types';

  let { story, hasContents = false }: { story: Story; hasContents?: boolean } = $props();

  let authors = $derived.by(() => {
    const selected = story.authors?.filter((author) => author.name?.trim()).slice(0, 3) ?? [];
    if (selected.length) return selected;

    const legacyName = story.researcher?.name?.trim() || story.byline.trim();
    return legacyName ? [{ ...story.researcher, name: legacyName }] : [];
  });

  function authorImageSrc(image = '') {
    const trimmed = image.trim();
    return trimmed && !/^(?:https?:|data:)/i.test(trimmed)
      ? `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`
      : trimmed;
  }

  function authorInitials(name = '') {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
</script>

{#if authors.length}
  <div class="story-author-shell" class:with-contents={hasContents}>
    <section
      id="article-author"
      class="story-authors"
      aria-label={authors.length === 1 ? 'Article author' : 'Article authors'}
    >
      {#each authors as author}
        {@const name = author.name?.trim() ?? ''}
        {@const role = author.role?.trim() ?? ''}
        {@const organisation = author.organisation?.trim() ?? ''}
        {@const imageSrc = authorImageSrc(author.image)}
        <div class="story-author">
          <div class="story-author__avatar" aria-hidden={imageSrc ? undefined : 'true'}>
            {#if imageSrc}
              <img src={imageSrc} alt={author.imageAlt ?? `${name}, article author`} />
            {:else}
              <span>{authorInitials(name)}</span>
            {/if}
          </div>

          <div class="story-author__details">
            <p class="story-author__name">{name}</p>
            {#if role || organisation}
              <p class="story-author__description">
                {#if role}<span>{role}</span>{/if}
                {#if role && organisation}
                  <span class="story-author__separator">
                    <span aria-hidden="true">|</span>
                    <span class="visually-hidden">, </span>
                  </span>
                {/if}
                {#if organisation}<span>{organisation}</span>{/if}
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </section>
  </div>
{/if}

<style>
  .story-author-shell {
    margin: 0 auto;
    max-width: calc(var(--measure-prose) + (var(--gutter) * 2));
    padding: 0 var(--gutter) var(--space-6);
  }

  .story-author-shell.with-contents {
    display: grid;
    gap: clamp(var(--space-6), 5vw, var(--space-8));
    grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
    max-width: calc(var(--wide) + (var(--gutter) * 2));
  }

  .story-author-shell.with-contents .story-authors {
    grid-column: 2;
  }

  .story-authors {
    display: grid;
    gap: var(--space-4) var(--space-5);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    padding-top: var(--space-2);
    scroll-margin-top: calc(var(--site-header-height, 3.25rem) + var(--space-4));
  }

  .story-author {
    align-items: center;
    display: flex;
    gap: var(--space-3);
    min-width: 0;
  }

  .story-author__avatar {
    align-items: center;
    background: var(--color-soft);
    border: 1px solid var(--color-line);
    border-radius: 50%;
    color: var(--color-accent-2);
    display: flex;
    flex: 0 0 3rem;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 700;
    height: 3rem;
    justify-content: center;
    overflow: hidden;
    width: 3rem;
  }

  .story-author__avatar img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .story-author__details {
    min-width: 0;
  }

  .story-author__name,
  .story-author__description {
    font-family: var(--font-sans);
    margin: 0;
  }

  .story-author__name {
    color: var(--color-accent-2);
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .story-author__description {
    align-items: baseline;
    color: var(--color-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 0.82rem;
    gap: 0.25rem 0.5rem;
    line-height: 1.35;
    margin-top: 0.18rem;
  }

  .story-author__separator {
    color: var(--color-faint);
  }

  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  @media (max-width: 860px) {
    .story-author-shell,
    .story-author-shell.with-contents {
      display: block;
      padding-bottom: var(--space-6);
    }

    .story-authors {
      gap: var(--space-3);
      grid-template-columns: minmax(0, 1fr);
      padding-top: var(--space-2);
    }

    .story-author {
      gap: 0.65rem;
    }

    .story-author__avatar {
      flex-basis: 2.65rem;
      height: 2.65rem;
      width: 2.65rem;
    }

    .story-author__name {
      font-size: 0.92rem;
    }

    .story-author__description {
      font-size: 0.76rem;
    }
  }

  @media print {
    .story-author-shell {
      display: none;
    }
  }
</style>
