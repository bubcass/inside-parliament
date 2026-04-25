<script lang="ts">
  import SectionStoryList from '$lib/components/story/SectionStoryList.svelte';
  import { getStoriesBySection, getStorySection } from '$lib/content/stories';

  const section = getStorySection('parliament-now');
  const stories = getStoriesBySection('parliament-now');
</script>

<svelte:head>
  <title>Parliament Now | Inside Parliament</title>
  <meta name="description" content={section?.intro} />
</svelte:head>

{#if section}
  <SectionStoryList {section} {stories} />
{/if}

