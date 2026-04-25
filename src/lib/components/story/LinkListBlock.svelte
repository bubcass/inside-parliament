<script lang="ts">
  import type { LinkListBlock } from '$lib/content/types';

  let { block }: { block: LinkListBlock } = $props();
</script>

<section class="link-list story-flow" aria-label={block.heading ?? block.eyebrow ?? 'Related links'}>
  {#if block.eyebrow}
    <p class="eyebrow">{block.eyebrow}</p>
  {/if}
  {#if block.heading}
    <h2>{block.heading}</h2>
  {/if}

  <div class="links">
    {#each block.links as link}
      <a class="link-card" href={link.href}>
        <span class="link-label">{link.label}</span>
        {#if link.description}
          <span class="link-description">{link.description}</span>
        {/if}
      </a>
    {/each}
  </div>
</section>

<style>
  .link-list {
    margin: var(--block-space) auto;
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

  .links {
    border-top: 1px solid var(--color-line);
    display: grid;
  }

  .link-card {
    align-items: baseline;
    border-bottom: 1px solid var(--color-line);
    color: var(--color-accent-2);
    display: grid;
    gap: var(--space-2);
    grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr);
    padding: var(--space-4) 0;
    text-decoration: none;
  }

  .link-card:hover,
  .link-card:focus-visible {
    color: var(--link-hover);
    text-decoration: none;
  }

  .link-label {
    align-items: baseline;
    display: inline-flex;
    font-size: 0.82rem;
    font-weight: var(--font-weight-meta);
    gap: 0.45rem;
    letter-spacing: 0.08em;
    line-height: var(--line-height-small);
    text-transform: uppercase;
  }

  .link-label::after {
    content: "↗";
    font-weight: 400;
    letter-spacing: 0;
    transform: translateY(-0.08em);
  }

  .link-description {
    color: var(--color-muted);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
  }

  .link-card:hover .link-description,
  .link-card:focus-visible .link-description {
    color: var(--color-ink);
  }

  @media (max-width: 620px) {
    .link-list {
      margin: 3.5rem auto;
    }

    .link-card {
      display: block;
    }

    .link-description {
      display: block;
      margin-top: var(--space-2);
    }
  }
</style>
