<script lang="ts">
    import StoryPage from "$lib/components/story/StoryPage.svelte";
    import type { Story } from "$lib/content/types";

    let {
        story = null,
        isPaused = false,
        embeddedImageCount = 0,
        suggestedPath = null,
        pausedTitle = "Preview paused",
        pausedCopy = "",
        pausedActionLabel = null,
        pausedAction = null,
        pausedActionDisabled = false,
        emptyTitle = "Preview",
        emptyCopy = "Start a draft or import a document to generate a live preview.",
    }: {
        story?: Story | null;
        isPaused?: boolean;
        embeddedImageCount?: number;
        suggestedPath?: string | null;
        pausedTitle?: string;
        pausedCopy?: string;
        pausedActionLabel?: string | null;
        pausedAction?: (() => void) | null;
        pausedActionDisabled?: boolean;
        emptyTitle?: string;
        emptyCopy?: string;
    } = $props();
</script>

<div class="preview-frame">
    {#if isPaused}
        <div class="preview-placeholder">
            <h2>{pausedTitle}</h2>
            <p>
                This document contains {embeddedImageCount} imported DOCX
                image{embeddedImageCount === 1 ? "" : "s"} still embedded for
                editing.
            </p>
            <p>{pausedCopy}</p>
            {#if pausedActionLabel || suggestedPath}
                <div class="preview-placeholder__actions">
                    {#if pausedActionLabel && pausedAction}
                        <button
                            type="button"
                            class="publish-button"
                            onclick={pausedAction}
                            disabled={pausedActionDisabled}
                        >
                            {pausedActionLabel}
                        </button>
                    {/if}
                    {#if suggestedPath}
                        <span>
                            Output:
                            <code>{suggestedPath}</code>
                        </span>
                    {/if}
                </div>
            {/if}
        </div>
    {:else if story}
        <StoryPage {story} />
    {:else}
        <div class="preview-placeholder">
            <h2>{emptyTitle}</h2>
            <p>{emptyCopy}</p>
        </div>
    {/if}
</div>

<style>
    .preview-frame {
        /* The studio canvas is intentionally light, independent of the reader's
           saved site theme. Without this boundary, dark foreground tokens can
           leak into the white preview surface. */
        color-scheme: light;
        --page-bg: #f6f3ea;
        --text: #4a463d;
        --text-soft: #5f5a50;
        --text-muted: #5c5649;
        --accent: #4a463d;
        --link: #5f4f1f;
        --link-hover: #7f6c2e;
        --border: #d4ccb8;
        --gold: #6b5922;
        --focus-ring: #3f3414;
        --color-ink: #4a463d;
        --color-muted: #5f5a50;
        --color-faint: #81796b;
        --color-soft: #ebe6da;
        --color-paper: #f6f3ea;
        --color-panel: #fffdf8;
        --color-surface-glass: rgba(255, 253, 248, 0.88);
        --color-nav-glass: rgba(246, 243, 234, 0.78);
        --color-line: #d4ccb8;
        --color-line-strong: #b9ae99;
        --color-accent: #6b5922;
        --color-accent-2: #4a463d;
        --color-focus: #3f3414;
        --interactive-surface: #fffdf8;
        --interactive-empty-seat: #fffdf8;
        --interactive-absent-seat: #d6d3d1;
        --interactive-seat-outline: #252621;
        --interactive-tooltip: rgba(255, 253, 248, 0.96);
        --interactive-shadow: rgba(47, 47, 47, 0.12);
        --interactive-stage-top: rgba(0, 0, 0, 0.18);
        --interactive-stage-bottom: rgba(0, 0, 0, 0.48);
        --interactive-stage-edge: rgba(0, 0, 0, 0.2);
        --interactive-overlay-start: rgba(24, 21, 18, 0.66);
        --interactive-overlay-end: rgba(24, 21, 18, 0.5);
        --interactive-overlay-border: rgba(255, 253, 248, 0.14);
        --interactive-overlay-text: rgba(255, 253, 248, 0.88);
        --interactive-overlay-heading: #fffdf8;
        --interactive-annotation: rgba(255, 253, 248, 0.82);
        --interactive-annotation-line: rgba(255, 253, 248, 0.7);
        background: #ffffff;
        color: var(--color-ink);
    }

    .preview-placeholder {
        max-width: 36rem;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
        color: #4c5967;
    }

    .preview-placeholder h2 {
        margin: 0;
    }

    .preview-placeholder__actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.85rem;
        margin-top: 1.4rem;
    }

    .preview-placeholder__actions span {
        color: #57534e;
        font-size: 0.92rem;
        line-height: 1.45;
    }

    .preview-placeholder__actions code {
        display: inline-block;
        margin-left: 0.35rem;
        padding: 0.1rem 0.3rem;
        background: #efefec;
        border: 1px solid #d7d7d2;
        border-radius: 4px;
        font-size: 0.85rem;
    }
</style>
