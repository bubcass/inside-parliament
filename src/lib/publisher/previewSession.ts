import type { Story } from '$lib/content/types';

export interface PublisherPreviewSnapshot {
  story: Story | null;
  isPaused: boolean;
  embeddedImageCount: number;
  suggestedPath: string | null;
  updatedAt: string;
}

export const PUBLISHER_PREVIEW_STORAGE_KEY = 'inside-parliament/publisher-preview';
export const PUBLISHER_PREVIEW_CHANNEL_NAME = 'inside-parliament/publisher-preview';

export function readPublisherPreviewSnapshot() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PUBLISHER_PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PublisherPreviewSnapshot;
  } catch {
    return null;
  }
}

export function writePublisherPreviewSnapshot(snapshot: PublisherPreviewSnapshot) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(
      PUBLISHER_PREVIEW_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
    return true;
  } catch {
    return false;
  }
}

export function createPublisherPreviewChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(PUBLISHER_PREVIEW_CHANNEL_NAME);
}

export function publishPublisherPreviewSnapshot(
  channel: BroadcastChannel | null,
  snapshot: PublisherPreviewSnapshot,
) {
  channel?.postMessage(snapshot);
}

export function publisherPreviewUrl(basePath: string) {
  return `${basePath || ''}/publisher/preview/`;
}
