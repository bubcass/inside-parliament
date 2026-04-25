<script lang="ts">
  import SectionStoryList from '$lib/components/story/SectionStoryList.svelte';
  import { getStoriesBySection, getStorySection } from '$lib/content/stories';

  const section = getStorySection('parliament-at-work');
  const stories = getStoriesBySection('parliament-at-work');
</script>

<svelte:head>
  <title>Parliament at Work | Inside Parliament</title>
  <meta name="description" content={section?.intro} />
</svelte:head>

{#if section}
  <SectionStoryList {section} {stories} />
{/if}
