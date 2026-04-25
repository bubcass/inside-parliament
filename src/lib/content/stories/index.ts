import type { Story, StorySection } from "../types";

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
      "A running account of activity across the Houses of the Oireachtas.",
  },
  {
    slug: "parliament-explained",
    title: "Parliament Explained",
    //eyebrow: "Civic explainers",
    intro:
      "Explore our guides to how Parliament works, including the work of Members, what happens in the Chambers, votes and our legislative process.",
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
  const timestamp = Date.parse(story.date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

const storyModules = import.meta.glob("./**/*.ts", {
  eager: true,
  import: "default",
}) as Record<string, Story>;

const storyList: Story[] = Object.entries(storyModules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, story]) => story);

export const stories: Story[] = [...storyList].sort(
  (a, b) => storyDateValue(b) - storyDateValue(a)
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
