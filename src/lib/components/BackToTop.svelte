<script lang="ts">
  import { onMount } from 'svelte';

  let visible = $state(false);

  function scrollToTop() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  onMount(() => {
    let updatePending = false;

    const updateVisibility = () => {
      updatePending = false;
      visible = window.scrollY > 640;
    };

    const handleScroll = () => {
      if (updatePending) return;
      updatePending = true;
      window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

{#if visible}
  <button
    class="page-back-to-top"
    type="button"
    aria-label="Back to top"
    title="Back to top"
    onclick={scrollToTop}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m6.5 14.5 5.5-5.5 5.5 5.5" />
    </svg>
  </button>
{/if}

<style>
  .page-back-to-top {
    position: fixed;
    right: max(var(--space-4), env(safe-area-inset-right));
    bottom: max(var(--space-4), env(safe-area-inset-bottom));
    z-index: 1300;
    display: grid;
    width: 2.7rem;
    height: 2.7rem;
    padding: 0;
    place-items: center;
    border: 3px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
    border-radius: 999px;
    background: var(--surface);
    box-shadow: var(--shadow-soft);
    color: var(--gold-hover);
    cursor: pointer;
    transition: box-shadow 160ms ease, transform 160ms ease;
  }

  .page-back-to-top:hover,
  .page-back-to-top:focus-visible {
    box-shadow: 0 0.6rem 1.2rem rgb(17 15 13 / 0.2);
    transform: translateY(-1px);
  }

  .page-back-to-top:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 3px;
  }

  svg {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.65;
  }

  @media (max-width: 620px) {
    .page-back-to-top {
      right: max(var(--space-3), env(safe-area-inset-right));
      bottom: max(var(--space-3), env(safe-area-inset-bottom));
      width: 2.4rem;
      height: 2.4rem;
    }

    svg {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
</style>
