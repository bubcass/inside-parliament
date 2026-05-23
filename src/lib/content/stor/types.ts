import type { Story, StoryBlock, StorySection, VideoAsset } from '../types';

export type StorDestination =
  | 'parliament-now'
  | 'parliament-explained'
  | 'parliament-at-work'
  | 'committee-reports'
  | 'houses-of-the-oireachtas'
  | 'library-research-service'
  | 'parliamentary-budget-office';

export type StorContentType =
  | 'committee-report'
  | 'article'
  | 'scrollytelling-article'
  | 'briefing'
  | 'visual-data-analysis'
  | 'research-note'
  | 'bill-digest';

export interface StorContributor {
  name: string;
  role: string;
  affiliation?: string;
  showAsAuthor?: boolean;
  profileRole?: string;
  profileImage?: string;
  bio?: string;
}

export interface StorHero {
  src: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  position?: string;
}

export interface ProseMirrorMark {
  type:
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strike'
    | 'code'
    | 'link'
    | 'superscript'
    | 'subscript';
  attrs?: {
    href?: string;
    target?: string;
    rel?: string;
    class?: string | null;
  };
}

export interface ProseMirrorNode {
  type:
    | 'doc'
    | 'heading'
    | 'paragraph'
    | 'text'
    | 'hardBreak'
    | 'orderedList'
    | 'bulletList'
    | 'listItem'
    | 'blockquote'
    | 'codeBlock'
    | 'imageBlock'
    | 'mediaTextBlock'
    | 'sceneScrollyBlock'
    | 'flourishBlock'
    | 'tableBlock';
  attrs?: Record<string, unknown> & {
    level?: number;
    start?: number;
  };
  text?: string;
  marks?: ProseMirrorMark[];
  content?: ProseMirrorNode[];
}

export interface ProseMirrorDocument {
  type: 'doc';
  content: ProseMirrorNode[];
}

export interface StorEnhancement {
  afterHeading?: string;
  block: StoryBlock;
}

export interface StorDocument {
  id: string;
  slug: string;
  type: StorContentType;
  destination: StorDestination;
  featured?: boolean;
  heroLayout?: Story['heroLayout'];
  showContents?: boolean;
  flourishWidth?: Story['flourishWidth'];
  title: string;
  dek: string;
  eyebrow?: string;
  byline?: string;
  abstract?: string;
  committeeName?: string;
  researcher?: Story['researcher'];
  section?: StorySection;
  topics?: string[];
  layout?: 'standard';
  status?: 'draft' | 'published' | 'archived';
  language?: string;
  version?: string;
  keywords?: string[];
  license?: string;
  doi?: string;
  publisher?: string;
  contributors?: StorContributor[];
  publishedDate?: string | null;
  hero?: StorHero;
  launchVideo?: VideoAsset;
  content: ProseMirrorDocument;
  enhancements?: StorEnhancement[];
}

export interface StorRenderResult {
  story: Story;
  source: StorDocument;
}

export type StorNarrativeBlock = Extract<StoryBlock, { type: 'text' }>;
