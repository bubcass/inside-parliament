import type { Story, StoryBlock, StorySection } from '../types';
import { proseMirrorToNarrativeBlocks } from './prosemirror';
import type { StorContributor, StorDocument, StorEnhancement, StorRenderResult } from './types';
import { validateStorDocument } from './validate';

function destinationToSection(document: StorDocument): StorySection {
  if (document.section) return document.section;

  switch (document.destination) {
    case 'parliament-now':
      return 'parliament-now';
    case 'parliament-explained':
      return 'parliament-explained';
    case 'parliament-at-work':
      return 'parliament-at-work';
    case 'committee-reports':
    case 'houses-of-the-oireachtas':
      return 'parliament-now';
    case 'library-research-service':
      return 'parliament-explained';
    case 'parliamentary-budget-office':
      return 'parliament-at-work';
  }
}

function sectionEyebrow(section: StorySection) {
  switch (section) {
    case 'parliament-now':
      return 'Parliament Now';
    case 'parliament-explained':
      return 'Parliament Explained';
    case 'parliament-at-work':
      return 'Parliament at Work';
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'Unpublished';

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;

  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp));
}

function estimateReadingTime(document: StorDocument) {
  const words = JSON.stringify(document.content)
    .replace(/[^A-Za-z0-9À-ÿ]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.round(words / 220))} min read`;
}

function visibleContributors(document: StorDocument) {
  const contributors = document.contributors ?? [];
  const hasExplicitDisplayChoice = contributors.some(
    (contributor) => typeof contributor.showAsAuthor === 'boolean',
  );

  if (hasExplicitDisplayChoice) {
    return contributors
      .filter(
        (contributor) =>
          contributor.showAsAuthor === true &&
          contributor.role.trim().toLowerCase() === 'author',
      )
      .slice(0, 3);
  }

  const legacyContributor =
    contributors.find(
      (contributor) => contributor.role.trim().toLowerCase() === 'author',
    ) ?? contributors[0];

  return legacyContributor ? [legacyContributor] : [];
}

function visibleAuthors(document: StorDocument, contributors: StorContributor[]) {
  const hasExplicitDisplayChoice = document.contributors?.some(
    (entry) => typeof entry.showAsAuthor === 'boolean',
  ) ?? false;

  if (hasExplicitDisplayChoice && !contributors.length) return [];
  if (!contributors.length) return document.researcher ? [document.researcher] : [];

  return contributors.map((contributor) => {
    const legacyProfile =
      document.researcher?.name?.trim().toLowerCase() === contributor.name.trim().toLowerCase()
        ? document.researcher
        : undefined;

    return {
      ...legacyProfile,
      name: contributor.name,
      role: contributor.profileRole ?? legacyProfile?.role,
      organisation: contributor.affiliation ?? legacyProfile?.organisation,
      bio: contributor.bio ?? legacyProfile?.bio,
      image: contributor.profileImage ?? legacyProfile?.image,
    };
  });
}

function formatAuthorNames(contributors: StorContributor[]) {
  const names = contributors.map((contributor) => contributor.name.trim()).filter(Boolean);
  if (names.length < 2) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function headingForBlock(block: StoryBlock) {
  if (block.type === 'text') return block.heading;
  if (block.type === 'media-text' || block.type === 'image') return block.heading;
  return undefined;
}

function applyEnhancements(blocks: StoryBlock[], enhancements: StorEnhancement[] = []) {
  if (!enhancements.length) return blocks;

  const output = [...blocks];

  for (const enhancement of enhancements) {
    if (!enhancement.afterHeading) {
      output.push(enhancement.block);
      continue;
    }

    const normalizedAnchor = enhancement.afterHeading.trim().toLowerCase();
    const index = output.findIndex((block) => {
      const heading = headingForBlock(block);
      return heading?.trim().toLowerCase() === normalizedAnchor;
    });

    if (index === -1) {
      output.push(enhancement.block);
      continue;
    }

    output.splice(index + 1, 0, enhancement.block);
  }

  return output;
}

export function storDocumentToStory(document: StorDocument): StorRenderResult {
  validateStorDocument(document);

  const contributors = visibleContributors(document);
  const authors = visibleAuthors(document, contributors);
  const section = destinationToSection(document);
  const blocks = applyEnhancements(
    proseMirrorToNarrativeBlocks(document.content, {
      title: document.title,
    }),
    document.enhancements,
  );

  return {
    source: document,
    story: {
      slug: document.slug,
      section,
      documentType: document.type === 'committee-report' ? 'article' : document.type,
      featured: document.featured ?? false,
      heroLayout: document.heroLayout ?? 'contained',
      showContents: document.showContents ?? false,
      flourishWidth: document.flourishWidth ?? 'prose',
      eyebrow: document.eyebrow ?? sectionEyebrow(section),
      title: document.title,
      dek: document.dek,
      byline:
        document.byline ??
        (formatAuthorNames(contributors) ||
          authors.map((author) => author.name?.trim()).filter(Boolean).join(', ') ||
          ''),
      abstract: document.abstract,
      ...(authors.length ? { authors, researcher: authors[0] } : {}),
      date: formatDate(document.publishedDate),
      publishedDate: document.publishedDate,
      readingTime: estimateReadingTime(document),
      heroImagePosition: document.hero?.position ?? 'center center',
      hero: {
        src: document.hero?.src ?? '',
        alt: document.hero?.alt ?? document.title,
        caption: document.hero?.caption ?? null,
        credit: document.hero?.credit ?? null,
      },
      blocks,
      shortVideos: document.shortVideos,
    },
  };
}
