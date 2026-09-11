export type StoryBlock =
  | TextBlock
  | TableStoryBlock
  | MediaTextBlock
  | ImageBlock
  | VideoBlock
  | FlourishStoryBlock
  | ChartStoryBlock
  | VoteMapStoryBlock
  | LinkListBlock
  | QuoteBlock
  | ScrollyBlock
  | SceneScrollyBlock;

export type StorySection = 'parliament-now' | 'parliament-explained' | 'parliament-at-work';
export type StoryHeroLayout = 'contained' | 'split' | 'immersive';

export interface StoryAuthorProfile {
  name?: string;
  role?: string;
  organisation?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
}

export interface StoryShortVideo {
  src: string;
  poster: string;
  title?: string;
  eyebrow?: string;
}

export interface Story {
  slug: string;
  section: StorySection;
  documentType?:
    | 'article'
    | 'scrollytelling-article'
    | 'briefing'
    | 'visual-data-analysis'
    | 'research-note'
    | 'bill-digest';
  featured?: boolean;
  heroLayout?: StoryHeroLayout;
  heroImagePosition?: string;
  showContents?: boolean;
  flourishWidth?: 'wide' | 'prose';
  title: string;
  /** Trusted inline HTML is supported for the story-page dek. */
  dek: string;
  eyebrow: string;
  byline: string;
  abstract?: string;
  /** Author profiles selected for display, in publisher order. Limited to three. */
  authors?: StoryAuthorProfile[];
  /** Legacy primary-author field retained for existing stories and integrations. */
  researcher?: StoryAuthorProfile;
  date: string;
  publishedDate?: string | null;
  readingTime: string;
  hero: ImageAsset;
  blocks: StoryBlock[];
  shortVideos?: StoryShortVideo[];
}

export interface ImageAsset {
  src: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
}

export interface VideoAsset {
  src: string;
  autoplay?: boolean;
  poster?: string;
  captions?: string | null;
  caption?: string | null;
  credit?: string | null;
}

export interface TextBlock {
  type: 'text';
  heading?: string;
  headingLevel?: 2 | 3;
  /** Trusted inline HTML is supported for links and emphasis. */
  paragraphs: string[];
}

export interface TableStoryBlock {
  type: 'table';
  html: string;
}

export interface MediaTextBlock {
  type: 'media-text';
  eyebrow?: string;
  heading?: string;
  /** Trusted inline HTML is supported for links and emphasis. */
  paragraphs: string[];
  media: {
    type: 'image' | 'video';
    asset: ImageAsset | VideoAsset;
  };
  mediaSide?: 'left' | 'right';
  /** Use contain for charts, diagrams and other images that must not be cropped. */
  fit?: 'cover' | 'contain';
}

export interface ImageBlock {
  type: 'image';
  heading?: string;
  image: ImageAsset;
  layout?: 'inline' | 'wide' | 'full' | 'portrait';
  /** Use contain for charts, diagrams and other images that must not be cropped. */
  fit?: 'cover' | 'contain';
}

export interface VideoBlock {
  type: 'video';
  video: VideoAsset;
}

export interface FlourishStoryBlock {
  type: 'flourish';
  embedType?: 'chart' | 'story' | 'visualisation';
  width?: 'wide' | 'prose';
  dataSrc: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
}

export interface ChartStoryBlock {
  type: 'chart';
  chart: string;
  data: string;
  title?: string;
  caption?: string;
}

export interface VoteMapStoryBlock {
  type: 'vote-map';
  title?: string;
  intro?: string;
  chamberSvg: string;
  voteData: string;
  seatData: string;
  membersData: string;
  caption?: string;
}

export interface LinkListItem {
  label: string;
  href: string;
  description?: string;
}

export interface LinkListBlock {
  type: 'link-list';
  eyebrow?: string;
  heading?: string;
  links: LinkListItem[];
}

export interface QuoteBlock {
  type: 'quote';
  text: string;
  attribution?: string;
}

export interface ScrollyStep {
  eyebrow?: string;
  title: string;
  body: string;
  image: ImageAsset;
}

export interface ScrollyBlock {
  type: 'scrolly';
  title: string;
  intro?: string;
  steps: ScrollyStep[];
}

export interface SceneScrollyAnnotation {
  label: string;
  x: number;
  y: number;
}

export interface SceneScrollyFocus {
  x: number;
  y: number;
  scale?: number;
}

export interface SceneScrollyStep {
  eyebrow?: string;
  title: string;
  body: string;
  image: ImageAsset;
  video?: VideoAsset;
  focus?: SceneScrollyFocus;
  overlayPosition?:
    | 'left-lower'
    | 'right-lower'
    | 'left-upper'
    | 'right-upper'
    | 'left-center'
    | 'right-center';
  placeLabel?: string;
  annotation?: SceneScrollyAnnotation;
}

export interface SceneScrollyBlock {
  type: 'scene-scrolly';
  title?: string;
  intro?: string;
  steps: SceneScrollyStep[];
}
