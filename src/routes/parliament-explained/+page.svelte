<script lang="ts">
  import SectionStoryList from '$lib/components/story/SectionStoryList.svelte';
  import { getStoriesBySection, getStorySection } from '$lib/content/stories';

  const section = getStorySection('parliament-explained');
  const stories = getStoriesBySection('parliament-explained');
</script>

<svelte:head>
  <title>Parliament Explained | Inside Parliament</title>
  <meta name="description" content={section?.intro} />
</svelte:head>

{#if section}
  <SectionStoryList {section} {stories} />
{/if}

