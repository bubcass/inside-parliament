<script lang="ts">
    import { onMount } from "svelte";
    import StoryPreviewPane from "$lib/publisher/StoryPreviewPane.svelte";
    import {
        createPublisherPreviewChannel,
        readPublisherPreviewSnapshot,
        type PublisherPreviewSnapshot,
    } from "$lib/publisher/previewSession";

    let snapshot = $state<PublisherPreviewSnapshot | null>(null);
    let connectionState = $state<"live" | "waiting">("waiting");

    function applySnapshot(nextSnapshot: PublisherPreviewSnapshot | null) {
        snapshot = nextSnapshot;
        connectionState = nextSnapshot ? "live" : "waiting";
    }

    function formatUpdatedAt(value: string | undefined) {
        if (!value) return "Waiting for a publisher session";

        const timestamp = Date.parse(value);
        if (Number.isNaN(timestamp)) return "Connected";

        return new Intl.DateTimeFormat("en-IE", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(new Date(timestamp));
    }

    onMount(() => {
        applySnapshot(readPublisherPreviewSnapshot());

        const channel = createPublisherPreviewChannel();
        const handleMessage = (event: MessageEvent<PublisherPreviewSnapshot>) =>
            applySnapshot(event.data);
        const handleStorage = (event: StorageEvent) => {
            if (!event.key?.includes("publisher-preview")) return;
            applySnapshot(readPublisherPreviewSnapshot());
        };

        channel?.addEventListener("message", handleMessage);
        window.addEventListener("storage", handleStorage);

        return () => {
            channel?.removeEventListener("message", handleMessage);
            channel?.close();
            window.removeEventListener("storage", handleStorage);
        };
    });
</script>

<svelte:head>
    <title>Detached Preview | Oireachtas Digital Publishing Studio</title>
    <meta
        name="description"
        content="Live detached preview for the Oireachtas Digital Publishing Studio."
    />
</svelte:head>

<div class="preview-page">
    <header class="preview-page__header">
        <div class="preview-page__copy">
            <span class="preview-page__eyebrow">Detached preview</span>
            <strong>Oireachtas Digital Publishing Studio</strong>
            <p>
                Keep this window on a second screen while the main publisher tab
                stays open.
            </p>
        </div>
        <div class="preview-page__status">
            <span
                class:preview-page__status-pill--waiting={connectionState ===
                    "waiting"}
                class="preview-page__status-pill"
            >
                {connectionState === "live" ? "Live sync" : "Waiting"}
            </span>
            <span>Updated {formatUpdatedAt(snapshot?.updatedAt)}</span>
        </div>
    </header>

    <div class="preview-page__frame">
        <StoryPreviewPane
            story={snapshot?.story ?? null}
            isPaused={snapshot?.isPaused ?? false}
            embeddedImageCount={snapshot?.embeddedImageCount ?? 0}
            suggestedPath={snapshot?.suggestedPath ?? null}
            pausedCopy="Convert the imported images into local media files from the main publisher tab to unlock the live web rendering here."
            emptyTitle="Preview waiting"
            emptyCopy="Open the main publisher and start editing an article to stream a live preview into this window."
        />
    </div>
</div>

<style>
    .preview-page {
        min-height: 100vh;
        background: #f4f5f6;
        color: #2f3134;
    }

    .preview-page__header {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #d4d7dc;
        background: rgba(251, 251, 250, 0.96);
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(8px);
    }

    .preview-page__copy {
        display: grid;
        gap: 0.2rem;
    }

    .preview-page__copy strong {
        font-size: 1.1rem;
    }

    .preview-page__copy p {
        margin: 0;
        color: #5b6066;
        font-size: 0.94rem;
        line-height: 1.45;
    }

    .preview-page__eyebrow {
        color: #4b4f55;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .preview-page__status {
        display: grid;
        gap: 0.25rem;
        justify-items: end;
        color: #5b6066;
        font-size: 0.88rem;
    }

    .preview-page__status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 6rem;
        padding: 0.35rem 0.65rem;
        border: 1px solid #2f3134;
        border-radius: 999px;
        background: #2f3134;
        color: #ffffff;
        font-weight: 700;
    }

    .preview-page__status-pill--waiting {
        border-color: #cfd3d8;
        background: #eceff2;
        color: #5b6066;
    }

    .preview-page__frame {
        min-height: calc(100vh - 5.75rem);
        background: #ffffff;
    }

    .preview-page__frame :global(.preview-frame) {
        min-height: calc(100vh - 5.75rem);
    }

    @media (max-width: 700px) {
        .preview-page__header {
            align-items: start;
        }

        .preview-page__status {
            justify-items: start;
        }
    }
</style>
