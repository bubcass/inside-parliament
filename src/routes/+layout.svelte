<script lang="ts">
    import "../styles.css";
    import { base } from "$app/paths";
    import { page } from "$app/state";
    import { onMount } from "svelte";

    let { children } = $props();
    let isHeaderCompact = $state(false);
    let isMobileViewport = $state(false);
    let mobileSectionMenuOpen = $state(false);
    let mobileSectionMenu: HTMLDivElement | undefined = $state();
    const isPublisherRoute = $derived(
        page.url.pathname === `${base}/publisher` ||
            page.url.pathname === `${base}/publisher/` ||
            page.url.pathname.startsWith(`${base}/publisher/`),
    );
    const isResourceRoute = $derived(
        page.url.pathname.startsWith(`${base}/stories/`) &&
            page.url.pathname !== `${base}/stories/`,
    );

    function closeMobileSectionMenu() {
        mobileSectionMenuOpen = false;
    }

    onMount(() => {
        const syncHeader = () => {
            const mobileMastheadHeight =
                document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 72;
            isMobileViewport = window.matchMedia("(max-width: 860px)").matches;
            const threshold = isMobileViewport ? mobileMastheadHeight : 72;
            isHeaderCompact =
                isResourceRoute &&
                (isMobileViewport || window.scrollY > threshold);
            if (!isHeaderCompact) closeMobileSectionMenu();
        };
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (
                mobileSectionMenuOpen &&
                mobileSectionMenu &&
                !mobileSectionMenu.contains(event.target as Node)
            ) {
                closeMobileSectionMenu();
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeMobileSectionMenu();
        };

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });
        window.addEventListener("pointerdown", closeOnOutsideClick);
        window.addEventListener("keydown", closeOnEscape);

        return () => {
            window.removeEventListener("scroll", syncHeader);
            window.removeEventListener("pointerdown", closeOnOutsideClick);
            window.removeEventListener("keydown", closeOnEscape);
        };
    });
</script>

<svelte:head>
    <title>Inside Parliament</title>
    <meta
        name="description"
        content="Get to know the work of the Houses of the Oireachtas."
    />
</svelte:head>

<a class="skip-link" href="#content">Skip to content</a>

<header
    class:site-header--studio={isPublisherRoute}
    class:site-header--resource={isResourceRoute}
    class:site-header--compact={isHeaderCompact}
    class="site-header"
    aria-label="Site header"
    aria-hidden={isResourceRoute && isHeaderCompact && isMobileViewport ? "true" : undefined}
    inert={isResourceRoute && isHeaderCompact && isMobileViewport ? true : undefined}
>
    {#if isPublisherRoute}
        <div class="publisher-header-lockup">
            <span class="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" fill="none" role="presentation" focusable="false">
                    <path d="M12 9H26L32 5L38 9H52" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                    <line x1="12" y1="10.5" x2="52" y2="10.5" stroke="currentColor" stroke-width="1.2" />
                    <rect x="12" y="10.5" width="40" height="13.5" stroke="currentColor" stroke-width="1.2" />
                    <line x1="27.5" y1="10.5" x2="27.5" y2="24" stroke="currentColor" stroke-width="1.1" />
                    <line x1="30" y1="10.5" x2="30" y2="24" stroke="currentColor" stroke-width="1.1" />
                    <line x1="34" y1="10.5" x2="34" y2="24" stroke="currentColor" stroke-width="1.1" />
                    <line x1="36.5" y1="10.5" x2="36.5" y2="24" stroke="currentColor" stroke-width="1.1" />
                    <line x1="26.5" y1="24" x2="37.5" y2="24" stroke="currentColor" stroke-width="1.2" />
                    <rect x="30.7" y="18.2" width="2.6" height="5.8" fill="currentColor" />
                    <rect x="15" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="19" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="23" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="39.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="43.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="47.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="15" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="19" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="23" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="39.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="43.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <rect x="47.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                    <line x1="12" y1="24" x2="52" y2="24" stroke="currentColor" stroke-width="1.2" />
                </svg>
            </span>
            <strong>Oireachtas Digital Publishing Studio</strong>
        </div>
    {:else}
        <nav class="site-nav" aria-label="Primary navigation">
            <a class="brand" href="{base}/" aria-label="Inside Parliament home">
                <span class="brand-mark" aria-hidden="true">
                    <svg viewBox="0 0 64 28" xmlns="http://www.w3.org/2000/svg" fill="none" role="presentation" focusable="false">
                        <path d="M12 9H26L32 5L38 9H52" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                        <line x1="12" y1="10.5" x2="52" y2="10.5" stroke="currentColor" stroke-width="1.2" />
                        <rect x="12" y="10.5" width="40" height="13.5" stroke="currentColor" stroke-width="1.2" />
                        <line x1="27.5" y1="10.5" x2="27.5" y2="24" stroke="currentColor" stroke-width="1.1" />
                        <line x1="30" y1="10.5" x2="30" y2="24" stroke="currentColor" stroke-width="1.1" />
                        <line x1="34" y1="10.5" x2="34" y2="24" stroke="currentColor" stroke-width="1.1" />
                        <line x1="36.5" y1="10.5" x2="36.5" y2="24" stroke="currentColor" stroke-width="1.1" />
                        <line x1="26.5" y1="24" x2="37.5" y2="24" stroke="currentColor" stroke-width="1.2" />
                        <rect x="30.7" y="18.2" width="2.6" height="5.8" fill="currentColor" />
                        <rect x="15" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="19" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="23" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="39.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="43.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="47.3" y="13" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="15" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="19" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="23" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="39.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="43.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <rect x="47.3" y="18" width="1.7" height="1.7" fill="currentColor" />
                        <line x1="12" y1="24" x2="52" y2="24" stroke="currentColor" stroke-width="1.2" />
                    </svg>
                </span>
                <span>Inside Parliament</span>
            </a>
            <div class="nav-links">
                <a href="{base}/parliament-now/">Parliament Now</a>
                <a href="{base}/parliament-explained/">Parliament Explained</a>
                <a href="{base}/parliament-at-work/">Parliament at Work</a>
                <a class="my-parliament-link" href="{base}/my-parliament/">
                    <span class="my-parliament-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false">
                            <circle cx="12" cy="7.25" r="3.35" fill="currentColor" />
                            <path d="M4.6 19.2C4.6 15.95 7.95 14.3 12 14.3C16.05 14.3 19.4 15.95 19.4 19.2V20.15H4.6V19.2Z" fill="currentColor" />
                        </svg>
                    </span>
                    <span>My Parliament</span>
                </a>
            </div>
        </nav>
    {/if}
</header>

{#if isResourceRoute}
    <div class="resource-mobile-tools" aria-label="Inside Parliament navigation">
        <div class="resource-mobile-nav" bind:this={mobileSectionMenu}>
            <button
                class="resource-mobile-nav__toggle"
                type="button"
                aria-expanded={mobileSectionMenuOpen}
                aria-controls="resource-mobile-section-menu"
                onclick={() => (mobileSectionMenuOpen = !mobileSectionMenuOpen)}
            >
                <span>Inside Parliament</span>
                <i aria-hidden="true"></i>
            </button>
            {#if mobileSectionMenuOpen}
                <nav id="resource-mobile-section-menu" class="resource-mobile-nav__menu" aria-label="Sections">
                    <a href="{base}/parliament-now/" onclick={closeMobileSectionMenu}>Parliament Now</a>
                    <a href="{base}/parliament-explained/" onclick={closeMobileSectionMenu}>Parliament Explained</a>
                    <a href="{base}/parliament-at-work/" onclick={closeMobileSectionMenu}>Parliament at Work</a>
                    <a href="{base}/my-parliament/" onclick={closeMobileSectionMenu}>My Parliament</a>
                </nav>
            {/if}
        </div>
    </div>
{/if}

<main id="content" class:resource-main={isResourceRoute}>
    {@render children()}
</main>

<footer class="site-footer">
    <p>Inside Parliament | Houses of the Oireachtas</p>
</footer>
