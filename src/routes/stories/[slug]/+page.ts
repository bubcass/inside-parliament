import { error } from '@sveltejs/kit';
import { getStory, stories } from '$lib/content/stories';

export function entries() {
  return stories.map((story) => ({ slug: story.slug }));
}

export function load({ params }) {
  const story = getStory(params.slug);

  if (!story) {
    error(404, 'Story not found');
  }

  return { story };
}
