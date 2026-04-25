<svelte:head>
    <title>About | Inside Parliament</title>
    <meta name="description" content="About the Inside Parliament prototype." />
</svelte:head>

<section class="page-shell about">
    <p class="eyebrow">About</p>
    <h1>
        A prototype for a reworked news and press section on <em
            >www.oireachtas.ie</em
        >
    </h1>
    <p class="lede">
        Inside Parliament demonstrates a clean static architecture for longform
        editorial work, with typed content, reusable blocks, local media and a
        build path for deployment.
    </p>
</section>

<style>
    .about {
        max-width: var(--measure-prose);
        padding-top: clamp(var(--space-7), 7vw, 4.75rem);
    }

    h1 {
        color: var(--color-accent-2);
        font-family: var(--font-sans);
        font-size: var(--font-size-h1);
        font-weight: var(--font-weight-heading);
        line-height: var(--line-height-heading);
        margin: 0 0 var(--space-4);
    }
</style>
