<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import type { SceneScrollyBlock, SceneScrollyStep } from '$lib/content/types';
  import { autoplayWhileVisible } from './videoAutoplayViewport';

  let { block }: { block: SceneScrollyBlock } = $props();
  let activeIndex = $state(0);
  let stepNodes: HTMLElement[] = [];
  let activeStep = $derived(block.steps[activeIndex] ?? block.steps[0]);
  let headingText = $derived(block.title?.trim() || 'Story scenes');
  let headingId = $derived(
    `scene-scrolly-${headingText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'story-block'}`
  );

  const sceneStyle = (step: SceneScrollyStep) => {
    const focus = step.focus ?? { x: 50, y: 50, scale: 1 };
    return `--focus-x: ${focus.x}%; --focus-y: ${focus.y}%; --focus-scale: ${focus.scale ?? 1};`;
  };

  const stepAlt = (step: SceneScrollyStep) => step.video?.caption || step.image.alt;

  onMount(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target instanceof HTMLElement) {
          activeIndex = Number(visible.target.dataset.index ?? 0);
        }
      },
      {
        rootMargin: '-42% 0px -42% 0px',
        threshold: [0.05, 0.2, 0.4]
      }
    );

    stepNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  });
</script>

<section
  class="scene-scrolly"
  class:has-intro={Boolean(block.title || block.intro)}
  aria-labelledby={headingId}
>
  {#if block.title || block.intro}
    <div class="scene-intro">
      {#if block.title}
        <h2 id={headingId}>{headingText}</h2>
      {/if}
      {#if block.intro}
        <p>{block.intro}</p>
      {/if}
    </div>
  {:else}
    <h2 id={headingId} class="sr-only">{headingText}</h2>
  {/if}

  <div class="scene-stage" style:--scene-count={block.steps.length}>
    <div class="scene-canvas">
      {#each block.steps as step, index}
        <figure
          class:active={index === activeIndex}
          aria-hidden={index !== activeIndex}
          style={sceneStyle(step)}
        >
          {#if step.video}
            <video
              use:autoplayWhileVisible={{ enabled: step.video.autoplay ?? true }}
              autoplay={step.video.autoplay ?? true}
              muted
              loop
              playsinline
              aria-label={stepAlt(step)}
              poster={step.video.poster ? `${base}${step.video.poster}` : undefined}
            >
              <source src="{base}{step.video.src}" type="video/mp4" />
            </video>
          {:else}
            <img
              src="{base}{step.image.src}"
              alt={step.image.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          {/if}
          {#if step.annotation}
            <figcaption
              class="annotation"
              style:left="{step.annotation.x}%"
              style:top="{step.annotation.y}%"
            >
              {step.annotation.label}
            </figcaption>
          {/if}
        </figure>
      {/each}

      {#if activeStep}
        <div class={`overlay-copy ${activeStep.overlayPosition ?? 'left-lower'}`}>
          {#if activeStep.placeLabel}
            <p class="place-label">{activeStep.placeLabel}</p>
          {/if}
          {#if activeStep.eyebrow}
            <p class="step-eyebrow">{activeStep.eyebrow}</p>
          {/if}
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
        </div>
      {/if}
    </div>

    <div class="scene-triggers" aria-label={`${block.title} scenes`}>
      {#each block.steps as step, index}
        <article
          class:active={index === activeIndex}
          data-index={index}
          bind:this={stepNodes[index]}
          aria-current={index === activeIndex ? 'step' : undefined}
        >
          <figure class="mobile-figure">
            {#if step.video}
              <video
                use:autoplayWhileVisible={{ enabled: step.video.autoplay ?? true }}
                autoplay={step.video.autoplay ?? true}
                muted
                loop
                playsinline
                aria-label={stepAlt(step)}
                poster={step.video.poster ? `${base}${step.video.poster}` : undefined}
              >
                <source src="{base}{step.video.src}" type="video/mp4" />
              </video>
            {:else}
              <img src="{base}{step.image.src}" alt={step.image.alt} loading="lazy" />
            {/if}
            {#if step.image.caption}
              <figcaption class="caption">{step.image.caption}</figcaption>
            {:else if step.video?.caption}
              <figcaption class="caption">{step.video.caption}</figcaption>
            {/if}
          </figure>
          {#if step.placeLabel}
            <p class="place-label">{step.placeLabel}</p>
          {/if}
          {#if step.eyebrow}
            <p class="step-eyebrow">{step.eyebrow}</p>
          {/if}
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .scene-scrolly {
    margin: var(--block-space) calc(var(--gutter) * -1);
    padding: 0;
  }

  .scene-intro {
    margin: 0 auto;
    max-width: var(--measure-prose);
    padding: var(--space-7) var(--gutter) 0;
  }

  h2 {
    color: var(--color-accent-2);
    font-family: var(--font-sans);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-3);
    text-wrap: balance;
  }

  .scene-intro > p:last-child {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
  }

  .scene-stage {
    margin-top: 0;
    min-height: calc((var(--scene-count) * 118vh) + 100vh);
    position: relative;
  }

  .scene-scrolly.has-intro .scene-stage {
    margin-top: var(--space-5);
  }

  .scene-canvas {
    background: var(--color-soft);
    height: calc(100vh - 3.25rem);
    min-height: 35rem;
    overflow: hidden;
    position: sticky;
    top: 3.25rem;
  }

  .scene-canvas::before,
  .scene-canvas::after {
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .scene-canvas::before {
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.18), transparent 28%),
      linear-gradient(to top, rgba(0, 0, 0, 0.48), transparent 54%);
  }

  .scene-canvas::after {
    background: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent 34%, transparent 66%, rgba(0, 0, 0, 0.14));
  }

  .scene-canvas figure {
    inset: 0;
    margin: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 420ms ease;
  }

  .scene-canvas figure.active {
    opacity: 1;
  }

  .scene-canvas img,
  .scene-canvas video {
    background: var(--color-soft);
    height: 100%;
    object-fit: cover;
    object-position: var(--focus-x) var(--focus-y);
    transform: scale(var(--focus-scale));
    transition: transform 520ms ease, object-position 520ms ease;
    width: 100%;
  }

  .annotation {
    border-top: 1px solid rgba(255, 253, 248, 0.7);
    color: rgba(255, 253, 248, 0.82);
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-meta);
    line-height: var(--line-height-small);
    max-width: 9rem;
    padding-top: var(--space-2);
    position: absolute;
    z-index: 2;
  }

  .annotation::before {
    background: rgba(255, 253, 248, 0.68);
    content: "";
    height: 0.4rem;
    left: 0;
    position: absolute;
    top: -0.2rem;
    width: 1px;
  }

  .overlay-copy {
    backdrop-filter: blur(10px);
    background: linear-gradient(
      180deg,
      rgba(24, 21, 18, 0.66),
      rgba(24, 21, 18, 0.5)
    );
    border: 1px solid rgba(255, 253, 248, 0.14);
    border-radius: 0.5rem;
    box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.16);
    color: var(--color-panel);
    max-width: min(29rem, calc(100% - (var(--gutter) * 2)));
    padding: var(--space-4) var(--space-4) var(--space-4);
    position: absolute;
    z-index: 3;
  }

  .overlay-copy.left-lower {
    bottom: clamp(var(--space-6), 8vh, var(--space-8));
    left: var(--gutter);
  }

  .overlay-copy.right-lower {
    bottom: clamp(var(--space-6), 8vh, var(--space-8));
    right: var(--gutter);
  }

  .overlay-copy.left-upper {
    left: var(--gutter);
    top: clamp(var(--space-6), 8vh, var(--space-8));
  }

  .overlay-copy.left-center {
    left: var(--gutter);
    top: 50%;
    transform: translateY(-50%);
  }

  .overlay-copy.right-upper {
    right: var(--gutter);
    top: clamp(var(--space-6), 8vh, var(--space-8));
  }

  .overlay-copy.right-center {
    right: var(--gutter);
    top: 50%;
    transform: translateY(-50%);
  }

  .place-label,
  .step-eyebrow {
    font-family: var(--font-sans);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-meta);
    letter-spacing: 0.11em;
    line-height: var(--line-height-small);
    margin: 0;
    text-transform: uppercase;
  }

  .place-label {
    border-top: 1px solid rgba(255, 253, 248, 0.62);
    color: rgba(255, 253, 248, 0.76);
    display: inline-block;
    margin-bottom: var(--space-3);
    padding-top: var(--space-2);
  }

  .step-eyebrow {
    color: rgba(255, 253, 248, 0.82);
    margin-bottom: var(--space-2);
  }

  .overlay-copy h3 {
    color: var(--color-panel);
    font-family: var(--font-sans);
    font-size: clamp(1.25rem, 2.2vw, 1.9rem);
    font-weight: var(--font-weight-heading);
    line-height: var(--line-height-heading);
    margin: 0 0 var(--space-2);
    text-wrap: balance;
  }

  .overlay-copy p:last-child {
    color: rgba(255, 253, 248, 0.88);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: 1.58;
    margin: 0;
  }

  .scene-triggers {
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  .sr-only {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  article {
    min-height: 118vh;
    opacity: 0;
    pointer-events: none;
  }

  article h3 {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-heading);
    line-height: 1.2;
    margin: 0 0 var(--space-2);
    text-wrap: balance;
  }

  article p:last-child {
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    margin: 0;
  }

  article .place-label {
    color: var(--color-muted);
  }

  article .step-eyebrow {
    color: var(--color-muted);
  }

  .mobile-figure {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .scene-canvas figure,
    .scene-canvas img {
      transition: none;
    }
  }

  @media (max-width: 820px) {
    .scene-scrolly {
      margin: 3.75rem calc(var(--gutter) * -1);
      padding: 0 0 var(--space-7);
    }

    .scene-stage {
      min-height: 0;
    }

    .scene-canvas {
      display: none;
    }

    .overlay-copy {
      backdrop-filter: none;
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
      transform: none;
    }

    .scene-triggers {
      display: grid;
      gap: var(--space-7);
      padding: 0 var(--gutter);
      pointer-events: auto;
      position: static;
    }

    article {
      border-left: 1px solid var(--color-line);
      min-height: 0;
      opacity: 1;
      padding: 0 0 0 var(--space-4);
      pointer-events: auto;
    }

    article .place-label,
    article .step-eyebrow {
      border: 0;
      color: var(--color-muted);
      display: block;
      margin-bottom: var(--space-2);
      padding: 0;
    }

    article h3 {
      font-size: clamp(1.05rem, 5vw, 1.28rem);
    }

    .mobile-figure {
      display: block;
      margin: 0 0 var(--space-3);
    }

    .mobile-figure img,
    .mobile-figure video {
      border: 1px solid var(--color-line);
      display: block;
      height: auto;
      width: 100%;
    }

    .mobile-figure .caption {
      margin-bottom: var(--space-3);
    }
  }
</style>
