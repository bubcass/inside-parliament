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
        background: #ffffff;
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
