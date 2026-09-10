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

function firstVisibleContributor(document: StorDocument) {
  const contributors = document.contributors ?? [];
  const hasExplicitDisplayChoice = contributors.some(
    (contributor) => typeof contributor.showAsAuthor === 'boolean',
  );

  if (hasExplicitDisplayChoice) {
    return (
      contributors.find(
        (contributor) =>
          contributor.showAsAuthor === true &&
          contributor.role.trim().toLowerCase() === 'author',
      ) ?? null
    );
  }

  return (
    contributors.find(
      (contributor) => contributor.role.trim().toLowerCase() === 'author',
    ) ??
    contributors[0] ??
    null
  );
}

function visibleResearcher(document: StorDocument, contributor: StorContributor | null) {
  const hasExplicitDisplayChoice = document.contributors?.some(
    (entry) => typeof entry.showAsAuthor === 'boolean',
  ) ?? false;

  if (hasExplicitDisplayChoice && !contributor) return undefined;
  if (!contributor) return document.researcher;

  return {
    ...document.researcher,
    name: contributor.name,
    role: contributor.profileRole ?? document.researcher?.role,
    organisation: contributor.affiliation ?? document.researcher?.organisation,
    bio: contributor.bio ?? document.researcher?.bio,
    image: contributor.profileImage ?? document.researcher?.image,
  };
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

  const contributor = firstVisibleContributor(document);
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
        contributor?.name ??
        '',
      abstract: document.abstract,
      researcher: visibleResearcher(document, contributor),
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
