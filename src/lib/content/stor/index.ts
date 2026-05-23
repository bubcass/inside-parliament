import type { StorySection } from '../types';
import type { StorDocument } from './types';
import { storDocumentToStory } from './toStory';

export interface StorListItem {
  slug: string;
  title: string;
  destination: StorDocument['destination'];
  section: StorySection;
  committeeName?: string;
  publishedDate?: string | null;
}

const documentModules = import.meta.glob(
  [
    './documents/parliament-now/**/*.json',
    './documents/parliament-explained/**/*.json',
    './documents/parliament-at-work/**/*.json',
    './documents/parliament-now/**/*.ts',
    './documents/parliament-explained/**/*.ts',
    './documents/parliament-at-work/**/*.ts',
  ],
  {
    eager: true,
    import: 'default',
  },
) as Record<string, StorDocument>;

export const storDocuments: StorDocument[] = Object.values(documentModules).sort(
  (a, b) => {
    const aTime = Date.parse(a.publishedDate ?? '') || 0;
    const bTime = Date.parse(b.publishedDate ?? '') || 0;
    return bTime - aTime;
  },
);

export const storRenderedDocuments = storDocuments.map((document) =>
  storDocumentToStory(document),
);

export const storStories = storRenderedDocuments.map((entry) => entry.story);

export const storDocumentList: StorListItem[] = storRenderedDocuments.map(
  ({ source, story }) => ({
    slug: source.slug,
    title: source.title,
    destination: source.destination,
    section: story.section,
    committeeName: source.committeeName,
    publishedDate: source.publishedDate ?? null,
  }),
);

export function getStorDocument(slug: string) {
  return storDocuments.find((document) => document.slug === slug) ?? null;
}

export function getStorRenderedDocument(slug: string) {
  return storRenderedDocuments.find((entry) => entry.source.slug === slug) ?? null;
}
