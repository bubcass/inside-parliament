<script lang="ts">
  import { base } from '$app/paths';
  import type { Story } from '$lib/content/types';

  let { story, hasContents = false }: { story: Story; hasContents?: boolean } = $props();

  let name = $derived(story.researcher?.name?.trim() || story.byline.trim());
  let role = $derived(story.researcher?.role?.trim() ?? '');
  let organisation = $derived(story.researcher?.organisation?.trim() ?? '');
  let image = $derived(story.researcher?.image?.trim() ?? '');
  let imageSrc = $derived(
    image && !/^(?:https?:|data:)/i.test(image)
      ? `${base}${image.startsWith('/') ? image : `/${image}`}`
      : image
  );
  let initials = $derived(
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  );
</script>

{#if name}
  <div class="story-author-shell" class:with-contents={hasContents}>
    <section id="article-author" class="story-author" aria-label="Article author">
      <div class="story-author__avatar" aria-hidden={image ? undefined : 'true'}>
        {#if imageSrc}
          <img src={imageSrc} alt={story.researcher?.imageAlt ?? `${name}, article author`} />
        {:else}
          <span>{initials}</span>
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
    </section>
  </div>
{/if}

<style>
  .story-author-shell {
    margin: 0 auto;
    max-width: calc(var(--measure-prose) + (var(--gutter) * 2));
    padding: 0 var(--gutter) var(--space-7);
  }

  .story-author-shell.with-contents {
    display: grid;
    gap: clamp(var(--space-6), 5vw, var(--space-8));
    grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
    max-width: calc(var(--wide) + (var(--gutter) * 2));
  }

  .story-author-shell.with-contents .story-author {
    grid-column: 2;
  }

  .story-author {
    align-items: center;
    border-top: 1px solid var(--color-line);
    display: flex;
    gap: var(--space-4);
    padding-top: var(--space-5);
    scroll-margin-top: calc(var(--site-header-height, 3.25rem) + var(--space-4));
  }

  .story-author__avatar {
    align-items: center;
    background: var(--color-soft);
    border: 1px solid var(--color-line);
    border-radius: 50%;
    color: var(--color-accent-2);
    display: flex;
    flex: 0 0 4.25rem;
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 700;
    height: 4.25rem;
    justify-content: center;
    overflow: hidden;
    width: 4.25rem;
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
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .story-author__description {
    align-items: baseline;
    color: var(--color-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 0.96rem;
    gap: 0.4rem 0.65rem;
    line-height: 1.45;
    margin-top: 0.35rem;
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

    .story-author {
      gap: var(--space-3);
      padding-top: var(--space-4);
    }

    .story-author__avatar {
      flex-basis: 3.5rem;
      height: 3.5rem;
      width: 3.5rem;
    }

    .story-author__name {
      font-size: 1.05rem;
    }

    .story-author__description {
      font-size: 0.88rem;
    }
  }

  @media print {
    .story-author-shell {
      display: none;
    }
  }
</style>
