<script lang="ts">
  import type { TableStoryBlock } from '$lib/content/types';

  let { block }: { block: TableStoryBlock } = $props();
</script>

<section class="table-block story-flow" aria-label="Table">
  <div class="table-shell">
    {@html block.html}
  </div>
</section>

<style>
  .table-block {
    margin: clamp(var(--space-7), 5vw, 4rem) auto;
    max-width: min(100%, calc(var(--measure-prose) + 12rem));
  }

  .table-shell {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--color-line) 78%, transparent);
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 0.65rem 1.5rem rgba(17, 27, 36, 0.05);
  }

  .table-shell :global(table) {
    width: 100%;
    border-collapse: collapse;
    min-width: 38rem;
  }

  .table-shell :global(thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .table-shell :global(th),
  .table-shell :global(td) {
    padding: 0.8rem 0.9rem;
    border: 1px solid color-mix(in srgb, var(--color-line) 72%, transparent);
    text-align: left;
    vertical-align: top;
    font-family: var(--font-serif);
    font-size: 0.98rem;
    line-height: 1.5;
  }

  .table-shell :global(th) {
    background: color-mix(in srgb, var(--color-accent-2) 8%, white);
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-weight: 700;
  }

  .table-shell :global(tbody tr:nth-child(even)) {
    background: color-mix(in srgb, var(--color-soft) 56%, white);
  }

  .table-shell :global(p) {
    margin: 0;
  }

  .table-shell :global(ul),
  .table-shell :global(ol) {
    margin: 0.35rem 0 0;
    padding-left: 1.25rem;
  }

  .table-shell :global(li) {
    margin: 0 0 0.3rem;
  }

  .table-shell :global(a) {
    color: var(--link);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 55%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .table-shell :global(a)::after {
    content: "↗";
    display: inline-block;
    font-size: 0.8em;
    margin-left: 0.14em;
    text-decoration: none;
    transform: translateY(-0.08em);
  }

  .table-shell :global(a:hover),
  .table-shell :global(a:focus-visible) {
    color: var(--link-hover);
    text-decoration-color: currentColor;
  }

  @media (max-width: 620px) {
    .table-block {
      margin: 3rem auto;
    }

    .table-shell :global(table) {
      min-width: 30rem;
    }
  }
</style>
