import { base } from '$app/paths';
import { plainText } from './storyToolbar';

export async function shareVideoAsset(options: {
  src: string;
  title?: string;
  text?: string;
}) {
  const url = new URL(`${base}${options.src}`, window.location.origin).toString();

  const shareData = {
    title: options.title ?? 'Inside Parliament video',
    text: options.text ? plainText(options.text) : undefined,
    url
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return 'copied';
  }

  return 'unsupported';
}
