<script lang="ts">
  import type { StoryBlock } from '$lib/content/types';
  import ImageBlock from './ImageBlock.svelte';
  import LinkListBlock from './LinkListBlock.svelte';
  import MediaTextBlock from './MediaTextBlock.svelte';
  import QuoteBlock from './QuoteBlock.svelte';
  import ScrollyBlock from './ScrollyBlock.svelte';
  import SceneScrollyBlock from './SceneScrollyBlock.svelte';
  import TextBlock from './TextBlock.svelte';
  import VideoBlock from './VideoBlock.svelte';

  let { block }: { block: StoryBlock } = $props();
</script>

{#if block.type === 'text'}
  <TextBlock {block} />
{:else if block.type === 'media-text'}
  <MediaTextBlock {block} />
{:else if block.type === 'image'}
  <ImageBlock {block} />
{:else if block.type === 'video'}
  <VideoBlock {block} />
{:else if block.type === 'link-list'}
  <LinkListBlock {block} />
{:else if block.type === 'quote'}
  <QuoteBlock {block} />
{:else if block.type === 'scrolly'}
  <ScrollyBlock {block} />
{:else if block.type === 'scene-scrolly'}
  <SceneScrollyBlock {block} />
{/if}
