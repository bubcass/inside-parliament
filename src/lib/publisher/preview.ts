import { storDocumentToStory } from '$lib/content/stor/toStory';
import { storDocumentToXml } from '$lib/content/stor/toXml';
import type {
  ProseMirrorDocument,
  ProseMirrorNode,
  StorContributor,
  StorDestination,
  StorDocument,
} from '$lib/content/stor/types';
import { suggestedStorDocumentPath } from './paths';

export interface PublisherPreviewMetadata {
  destination: StorDestination;
  type: StorDocument['type'];
  featured: boolean;
  heroLayout: NonNullable<StorDocument['heroLayout']> | 'none';
  showContents: boolean;
  title: string;
  dek: string;
  eyebrow: string;
  abstract: string;
  publishedDate: string;
  status: NonNullable<StorDocument['status']>;
  language: string;
  keywords: string;
  heroSrc: string;
  heroAlt: string;
  heroPosition: string;
  slug: string;
}

export function slugifyPublisherValue(input: string) {
  const base = input.trim() || 'untitled-story';
  return (
    base
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-]+|[-]+$/g, '')
      .toLowerCase() || 'untitled-story'
  );
}

function splitKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/[,;]\s*|\s*\n+\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function embeddedImageStats(document: ProseMirrorDocument | null) {
  if (!document) {
    return { count: 0, totalChars: 0 };
  }

  let count = 0;
  let totalChars = 0;

  const visit = (node: ProseMirrorNode) => {
    if (node.type === 'imageBlock') {
      const src = String(node.attrs?.src ?? '').trim();
      if (src.startsWith('data:image/')) {
        count += 1;
        totalChars += src.length;
      }
    }

    for (const child of node.content ?? []) {
      visit(child);
    }
  };

  for (const node of document.content ?? []) {
    visit(node);
  }

  return { count, totalChars };
}

export interface PublisherShortVideoCandidate {
  src: string;
  poster: string;
  title: string;
  eyebrow: string;
}

export function extractPublisherShortVideoCandidates(options: {
  metadata: Pick<PublisherPreviewMetadata, 'title' | 'eyebrow'>;
  editorDocument: ProseMirrorDocument;
}) {
  const candidates: PublisherShortVideoCandidate[] = [];

  for (const node of options.editorDocument.content ?? []) {
    if (node.type === 'videoBlock' && node.attrs?.featureLatestVideo) {
      const src = String(node.attrs?.src ?? '').trim();
      const poster = String(node.attrs?.poster ?? '').trim();
      if (!src) continue;

      candidates.push({
        src,
        poster,
        title: String(node.attrs?.carouselTitle ?? '').trim() || options.metadata.title.trim(),
        eyebrow:
          String(node.attrs?.carouselEyebrow ?? '').trim() || options.metadata.eyebrow.trim(),
      });
      continue;
    }

    if (
      node.type === 'mediaTextBlock' &&
      node.attrs?.featureLatestVideo &&
      String(node.attrs?.mediaType ?? '').trim() === 'video'
    ) {
      const src = String(node.attrs?.src ?? '').trim();
      const poster = String(node.attrs?.poster ?? '').trim();
      if (!src) continue;

      candidates.push({
        src,
        poster,
        title: String(node.attrs?.carouselTitle ?? '').trim() || options.metadata.title.trim(),
        eyebrow:
          String(node.attrs?.carouselEyebrow ?? '').trim() || options.metadata.eyebrow.trim(),
      });
    }
  }

  return candidates;
}

export function buildCanonicalPublisherDocument({
  metadata,
  contributors,
  importedFilename,
  editorDocument,
}: {
  metadata: PublisherPreviewMetadata;
  contributors: StorContributor[];
  importedFilename: string;
  editorDocument: ProseMirrorDocument;
}): StorDocument {
  const title = metadata.title.trim();
  const publishedDate = metadata.publishedDate.trim() || null;
  const generatedSlug = slugifyPublisherValue(
    `${title || importedFilename || 'untitled'}${publishedDate ? `-${publishedDate.slice(0, 10).replace(/-/g, '')}` : ''}`,
  );
  const slug = metadata.slug.trim() || generatedSlug;
  const keywordList = splitKeywords(metadata.keywords);
  const derivedEyebrow = metadata.eyebrow.trim();
  const hasExplicitDisplayChoice = contributors.some(
    (contributor) => typeof contributor.showAsAuthor === 'boolean',
  );
  const selectedAuthorContributors = (hasExplicitDisplayChoice
    ? contributors.filter(
        (contributor) =>
          contributor.showAsAuthor === true &&
          contributor.role.trim().toLowerCase() === 'author',
      )
    : contributors.filter(
        (contributor) => contributor.role.trim().toLowerCase() === 'author',
      )).slice(0, 3);
  const authorContributors =
    selectedAuthorContributors.length || hasExplicitDisplayChoice
      ? selectedAuthorContributors
      : contributors.slice(0, 1);
  const authorContributor = authorContributors[0] ?? null;
  const authorName = authorContributor?.name?.trim() ?? '';
  const authorOrganisation = authorContributor?.affiliation?.trim() ?? '';
  const authorProfileRole = authorContributor?.profileRole?.trim() ?? '';
  const authorProfileImage = authorContributor?.profileImage?.trim() ?? '';
  const authorBio = authorContributor?.bio?.trim() ?? '';
  const shortVideoCandidates = extractPublisherShortVideoCandidates({
    metadata: {
      title: title || 'Untitled document',
      eyebrow: derivedEyebrow,
    },
    editorDocument,
  });

  return {
    id: slug,
    slug,
    type: metadata.type,
    destination: metadata.destination,
    featured: metadata.featured,
    ...(metadata.heroLayout !== 'none' ? { heroLayout: metadata.heroLayout } : {}),
    showContents: metadata.showContents,
    title: title || 'Untitled document',
    dek: metadata.dek,
    ...(derivedEyebrow ? { eyebrow: derivedEyebrow } : {}),
    ...(metadata.abstract.trim() ? { abstract: metadata.abstract.trim() } : {}),
    ...(keywordList.length ? { topics: keywordList } : {}),
    layout: 'standard',
    status: metadata.status,
    language: metadata.language.trim() || 'en',
    keywords: keywordList,
    publishedDate,
    contributors: contributors
      .map((contributor) => ({
        name: contributor.name.trim(),
        role: contributor.role.trim(),
        affiliation: contributor.affiliation?.trim() || undefined,
        showAsAuthor: contributor.showAsAuthor ?? false,
        profileRole: contributor.profileRole?.trim() || undefined,
        profileImage: contributor.profileImage?.trim() || undefined,
        bio: contributor.bio?.trim() || undefined,
      }))
      .filter((contributor) => contributor.name && contributor.role),
    ...(authorName || authorProfileRole || authorOrganisation || authorBio || authorProfileImage
      ? {
          researcher: {
            ...(authorName ? { name: authorName } : {}),
            ...(authorProfileRole ? { role: authorProfileRole } : {}),
            ...(authorOrganisation ? { organisation: authorOrganisation } : {}),
            ...(authorBio ? { bio: authorBio } : {}),
            ...(authorProfileImage ? { image: authorProfileImage } : {}),
          },
        }
      : {}),
    hero:
      metadata.heroLayout !== 'none' && metadata.heroSrc.trim()
        ? {
            src: metadata.heroSrc.trim(),
            alt: metadata.heroAlt.trim() || title || 'Story hero image',
            position: metadata.heroPosition.trim() || 'center center',
          }
        : undefined,
    ...(shortVideoCandidates[0]?.poster
      ? {
          shortVideos: [
            {
              src: shortVideoCandidates[0].src,
              poster: shortVideoCandidates[0].poster,
              ...(shortVideoCandidates[0].title
                ? { title: shortVideoCandidates[0].title }
                : {}),
              ...(shortVideoCandidates[0].eyebrow
                ? { eyebrow: shortVideoCandidates[0].eyebrow }
                : {}),
            },
          ],
        }
      : {}),
    content: editorDocument,
  };
}

export function buildRenderedPublisherPreview(document: StorDocument | null) {
  if (!document) return null;
  if (embeddedImageStats(document.content).count > 0) {
    return null;
  }

  try {
    return storDocumentToStory(document);
  } catch {
    return null;
  }
}

export function buildSuggestedPublisherPath(document: StorDocument | null) {
  if (!document) return null;

  return suggestedStorDocumentPath({
    destination: document.destination,
    slug: document.slug,
  });
}

export function buildPublisherXmlPreview(document: StorDocument | null) {
  if (!document) return null;
  if (embeddedImageStats(document.content).count > 0) {
    return null;
  }

  try {
    return storDocumentToXml(document);
  } catch {
    return null;
  }
}
