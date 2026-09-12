<script lang="ts">
    import "../styles.css";
    import { base } from "$app/paths";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import BackToTop from "$lib/components/BackToTop.svelte";
    import type { StorySection } from "$lib/content/types";

    let { children } = $props();
    let isMobileViewport = $state(false);
    let theme = $state<'light' | 'dark'>('light');
    let mobileSectionMenuOpen = $state(false);
    let mobileSectionActionsOpen = $state(false);
    let mobileSectionMenu: HTMLDivElement | undefined = $state();
    let mobileSectionActions: HTMLDivElement | undefined = $state();
    const isPublisherRoute = $derived(
        page.url.pathname === `${base}/publisher` ||
            page.url.pathname === `${base}/publisher/` ||
            page.url.pathname.startsWith(`${base}/publisher/`),
    );
    const isResourceRoute = $derived(
        page.url.pathname.startsWith(`${base}/stories/`) &&
            page.url.pathname !== `${base}/stories/`,
    );
    const sectionLabels: Record<StorySection, string> = {
        "parliament-now": "Parliament Now",
        "parliament-explained": "Parliament Explained",
        "parliament-at-work": "Parliament at Work",
    };
    const activeSection = $derived.by<StorySection | null>(() => {
        const pathname = page.url.pathname.replace(/\/+$/, "") || "/";
        if (isResourceRoute) {
            return (page.data.story as { section?: StorySection } | undefined)?.section ?? null;
        }
        if (pathname === `${base}/parliament-now`) return "parliament-now";
        if (pathname === `${base}/parliament-explained`) return "parliament-explained";
        if (pathname === `${base}/parliament-at-work`) return "parliament-at-work";
        return null;
    });
    const mobileSectionLabel = $derived.by(() => {
        const pathname = page.url.pathname.replace(/\/+$/, "") || "/";
        if (activeSection) return sectionLabels[activeSection];
        if (pathname === `${base}/my-parliament`) return "My Parliament";
        return "Inside Parliament";
    });
    const mobileSectionItems = [
        { href: `${base}/`, label: "Inside Parliament" },
        { href: `${base}/parliament-now/`, label: "Parliament Now" },
        { href: `${base}/parliament-explained/`, label: "Parliament Explained" },
        { href: `${base}/parliament-at-work/`, label: "Parliament at Work" },
        { href: `${base}/my-parliament/`, label: "My Parliament" },
    ];

    function isCurrentMobileSection(href: string) {
        const current = page.url.pathname.replace(/\/+$/, "") || "/";
        const target = href.replace(/\/+$/, "") || "/";
        return current === target || (activeSection !== null && target === `${base}/${activeSection}`);
    }

    function closeMobileSectionMenu() {
        mobileSectionMenuOpen = false;
    }

    function closeMobileSectionActions() {
        mobileSectionActionsOpen = false;
    }

    function closeMobileTools() {
        closeMobileSectionMenu();
        closeMobileSectionActions();
    }

    function toggleTheme() {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = theme;
        window.dispatchEvent(new CustomEvent('inside-parliament:theme-changed', { detail: theme }));
        try {
            localStorage.setItem('inside-parliament-theme', theme);
        } catch {
            // The chosen theme remains active for this visit when storage is unavailable.
        }
    }

    onMount(() => {
        const storedTheme = document.documentElement.dataset.theme;
        theme = storedTheme === 'dark' ? 'dark' : 'light';
        const syncHeader = () => {
            isMobileViewport = window.matchMedia("(max-width: 860px)").matches;
            if (!isResourceRoute) closeMobileTools();
        };
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (
                (mobileSectionMenuOpen || mobileSectionActionsOpen) &&
                !mobileSectionMenu?.contains(event.target as Node) &&
                !mobileSectionActions?.contains(event.target as Node)
            ) {
                closeMobileTools();
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeMobileTools();
        };

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });
        window.addEventListener("pointerdown", closeOnOutsideClick);
        window.addEventListener("keydown", closeOnEscape);
        window.addEventListener("inside-parliament:toggle-theme", toggleTheme);

        return () => {
            window.removeEventListener("scroll", syncHeader);
            window.removeEventListener("pointerdown", closeOnOutsideClick);
            window.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("inside-parliament:toggle-theme", toggleTheme);
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
    class:site-header--compact={isResourceRoute}
    class="site-header"
    aria-label="Site header"
    aria-hidden={isResourceRoute && isMobileViewport ? "true" : undefined}
    inert={isResourceRoute && isMobileViewport ? true : undefined}
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
            <a
                class="oireachtas-home"
                href="https://www.oireachtas.ie/"
                aria-label="Return to oireachtas.ie"
                title="Return to oireachtas.ie"
            >
                <img src="{base}/brand/oireachtas-logo.svg" alt="" />
            </a>
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
                <span class="brand-copy">
                    <span class="brand-title">Inside Parliament</span>
                </span>
            </a>
            <div class="site-header-actions">
                <button
                    class="theme-toggle"
                    type="button"
                    onclick={toggleTheme}
                    aria-pressed={theme === 'dark'}
                    aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {#if theme === 'dark'}
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                        </svg>
                    {:else}
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
                        </svg>
                    {/if}
                </button>
            </div>
        </nav>
        <nav class="section-nav" aria-label="Inside Parliament sections">
            <div class="nav-links">
                <a href="{base}/parliament-now/" aria-current={activeSection === "parliament-now" ? "page" : undefined}>Parliament Now</a>
                <a href="{base}/parliament-explained/" aria-current={activeSection === "parliament-explained" ? "page" : undefined}>Parliament Explained</a>
                <a href="{base}/parliament-at-work/" aria-current={activeSection === "parliament-at-work" ? "page" : undefined}>Parliament at Work</a>
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

{#if !isPublisherRoute}
    <div
        class="mobile-section-tools"
        class:resource-mobile-tools={isResourceRoute}
        class:section-mobile-tools={!isResourceRoute}
        aria-label="Inside Parliament navigation"
    >
        <div class="resource-mobile-nav" bind:this={mobileSectionMenu}>
            <button
                class="resource-mobile-nav__toggle"
                type="button"
                aria-expanded={mobileSectionMenuOpen}
                aria-controls="resource-mobile-section-menu"
                onclick={() => (mobileSectionMenuOpen = !mobileSectionMenuOpen)}
            >
                <span>{mobileSectionLabel}</span>
                <i aria-hidden="true"></i>
            </button>
            {#if mobileSectionMenuOpen}
                <nav id="resource-mobile-section-menu" class="resource-mobile-nav__menu" aria-label="Sections">
                    {#each mobileSectionItems as item}
                        <a
                            href={item.href}
                            aria-current={isCurrentMobileSection(item.href) ? "page" : undefined}
                            onclick={closeMobileSectionMenu}
                        >{item.label}</a>
                    {/each}
                </nav>
            {/if}
        </div>
        {#if !isResourceRoute}
            <div class="mobile-section-actions" bind:this={mobileSectionActions}>
                <button
                    class="mobile-section-actions__toggle"
                    type="button"
                    aria-label="More page actions"
                    aria-expanded={mobileSectionActionsOpen}
                    aria-controls="mobile-section-actions-menu"
                    onclick={() => (mobileSectionActionsOpen = !mobileSectionActionsOpen)}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="5" cy="12" r="1.8"></circle>
                        <circle cx="12" cy="12" r="1.8"></circle>
                        <circle cx="19" cy="12" r="1.8"></circle>
                    </svg>
                </button>
                {#if mobileSectionActionsOpen}
                    <div id="mobile-section-actions-menu" class="mobile-section-actions__menu">
                        <button
                            type="button"
                            onclick={() => {
                                toggleTheme();
                                closeMobileSectionActions();
                            }}
                        >
                            <span class="mobile-section-action-icon" aria-hidden="true">
                                {#if theme === 'dark'}
                                    <svg viewBox="0 0 24 24" focusable="false">
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                                    </svg>
                                {:else}
                                    <svg viewBox="0 0 24 24" focusable="false">
                                        <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
                                    </svg>
                                {/if}
                            </span>
                            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<main id="content" class:resource-main={isResourceRoute}>
    {@render children()}
</main>

{#if !isPublisherRoute}
    <BackToTop />
{/if}

<footer class="site-footer">
    <p>Inside Parliament | Houses of the Oireachtas</p>
</footer>
