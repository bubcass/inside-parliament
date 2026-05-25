import type { Story, StorySection } from "../types";
import { storStories } from "../stor";

export interface StorySectionMeta {
  slug: StorySection;
  title: string;
  eyebrow?: string;
  intro: string;
}

export const storySections: StorySectionMeta[] = [
  {
    slug: "parliament-now",
    title: "Parliament Now",
    //eyebrow: "Current work",
    intro:
      "The latest from Leinster House, the seat of the Houses of the Oireachtas.",
  },
  {
    slug: "parliament-explained",
    title: "Parliament Explained",
    //eyebrow: "Civic explainers",
    intro:
      "Explore our guides to how Parliament works, including what Members do, what happens in the Chambers, votes and our legislative process.",
  },
  {
    slug: "parliament-at-work",
    title: "Parliament at Work",
    //eyebrow: "Inside the institution",
    intro:
      "Get to know the work of the Houses better with the people who know it best.",
  },
];

function storyDateValue(story: Story) {
  const timestamp = Date.parse(story.publishedDate ?? story.date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

const storyModules = import.meta.glob("./**/*.ts", {
  eager: true,
  import: "default",
}) as Record<string, Story>;

const storyList: Story[] = Object.entries(storyModules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, story]) => story);

const mergedStories = new Map<string, Story>();

for (const story of storyList) {
  mergedStories.set(story.slug, story);
}

for (const story of storStories) {
  mergedStories.set(story.slug, story);
}

export const stories: Story[] = [...mergedStories.values()].sort(
  (a, b) => {
    const dateDelta = storyDateValue(b) - storyDateValue(a);
    if (dateDelta !== 0) return dateDelta;

    return a.slug.localeCompare(b.slug);
  },
);

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}

export function getStoriesBySection(section: StorySection) {
  return stories.filter((story) => story.section === section);
}

export function getStorySection(section: StorySection) {
  return storySections.find((entry) => entry.slug === section);
}
