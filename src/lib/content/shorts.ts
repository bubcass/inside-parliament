import type { Story } from './types';

export interface ShortVideoItem {
  slug: string;
  title: string;
  eyebrow: string;
  date: string;
  poster: string;
  src: string;
}

export function getShortVideos(stories: Story[], limit = 8): ShortVideoItem[] {
  return stories
    .flatMap((story) =>
      (story.shortVideos ?? [])
        .filter((item) => item.src.trim() && item.poster.trim())
        .map((item) => ({
          slug: story.slug,
          title: item.title?.trim() || story.title,
          eyebrow: item.eyebrow?.trim() || story.eyebrow,
          date: story.date,
          poster: item.poster,
          src: item.src,
        })),
    )
    .slice(0, limit);
}
