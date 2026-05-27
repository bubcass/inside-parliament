import type { StorDestination } from '$lib/content/stor/types';
import { destinationFolder } from './paths';

export type PublisherAssetScope = 'story' | 'shared';
export type PublisherAssetKind = 'image' | 'video' | 'audio' | 'captions' | 'other';

export interface PublisherAssetEntry {
  path: string;
  name: string;
  scope: PublisherAssetScope;
  kind: PublisherAssetKind;
  modifiedAt: string;
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg']);
const CAPTION_EXTENSIONS = new Set(['.vtt', '.srt']);

export function storyAssetFolderRelative(options: {
  destination: StorDestination;
  slug: string;
}) {
  return `media/${destinationFolder(options.destination)}/${options.slug}`;
}

export function sharedAssetFolderRelative() {
  return 'media/shared';
}

export function classifyPublisherAssetKind(filename: string): PublisherAssetKind {
  const extension = extensionForFilename(filename);

  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (CAPTION_EXTENSIONS.has(extension)) return 'captions';

  return 'other';
}

export function isPublisherAssetFilenameAllowed(filename: string) {
  return classifyPublisherAssetKind(filename) !== 'other';
}

export function sanitizePublisherAssetFilename(filename: string) {
  const trimmed = filename.trim();
  const extension = extensionForFilename(trimmed).toLowerCase();
  const basename = extension ? trimmed.slice(0, -extension.length) : trimmed;
  const normalizedBase = slugifyPathSegment(basename || 'asset');

  return `${normalizedBase}${extension}`;
}

function extensionForFilename(filename: string) {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/i);
  return match?.[1] ?? '';
}

function slugifyPathSegment(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-]+|[-]+$/g, '')
      .toLowerCase() || 'asset'
  );
}
