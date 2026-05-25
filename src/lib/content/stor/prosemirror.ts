import type {
  ProseMirrorDocument,
  ProseMirrorMark,
  ProseMirrorNode,
} from './types';
import type { StoryBlock } from '../types';

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderMarkedText(text: string, marks: ProseMirrorMark[] = []) {
  let output = escapeHtml(text);

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        output = `<strong>${output}</strong>`;
        break;
      case 'italic':
        output = `<em>${output}</em>`;
        break;
      case 'underline':
        output = `<u>${output}</u>`;
        break;
      case 'strike':
        output = `<s>${output}</s>`;
        break;
      case 'code':
        output = `<code>${output}</code>`;
        break;
      case 'superscript':
        output = `<sup>${output}</sup>`;
        break;
      case 'subscript':
        output = `<sub>${output}</sub>`;
        break;
      case 'link':
        if (mark.attrs?.href?.startsWith('#')) {
          break;
        }

        output = `<a href="${escapeHtml(mark.attrs?.href ?? '#')}">${output}</a>`;
        break;
    }
  }

  return output;
}

export function renderInline(node: ProseMirrorNode): string {
  switch (node.type) {
    case 'text':
      return renderMarkedText(node.text ?? '', node.marks);
    case 'hardBreak':
      return '<br>';
    default:
      return (node.content ?? []).map(renderInline).join('');
  }
}

export function renderList(node: ProseMirrorNode): string {
  const tag = node.type === 'orderedList' ? 'ol' : 'ul';
  const items = (node.content ?? []).map((item) => {
    const body = (item.content ?? [])
      .map((child) => {
        if (child.type === 'orderedList' || child.type === 'bulletList') {
          return renderList(child);
        }

        return renderInline(child);
      })
      .join('');

    return `<li>${body}</li>`;
  });

  return `<${tag}>${items.join('')}</${tag}>`;
}

function isOrderedListHtml(value: string) {
  return /^\s*<ol>/i.test(value) && /<\/ol>\s*$/i.test(value);
}

function mergeOrderedListHtml(previous: string, current: string) {
  if (!isOrderedListHtml(previous) || !isOrderedListHtml(current)) {
    return null;
  }

  const previousItems = previous.replace(/^\s*<ol>/i, '').replace(/<\/ol>\s*$/i, '');
  const currentItems = current.replace(/^\s*<ol>/i, '').replace(/<\/ol>\s*$/i, '');

  return `<ol>${previousItems}${currentItems}</ol>`;
}

function appendParagraphToLastListItem(listHtml: string, paragraphHtml: string) {
  if (!isOrderedListHtml(listHtml)) return null;

  return listHtml.replace(/<\/li>(?![\s\S]*<\/li>)/i, `${paragraphHtml}</li>`);
}

function endsWithSentencePunctuation(value: string) {
  return /[.!?;:]$/.test(stripHtml(value));
}

export interface CommitteeReportNode {
  type:
    | 'heading'
    | 'paragraph'
    | 'flourish'
    | 'image'
    | 'video'
    | 'table'
    | 'media-text'
    | 'scene-scrolly'
    | 'link-list';
  level?: number;
  text: string;
  block?: Extract<
    StoryBlock,
    {
      type:
        | 'flourish'
        | 'image'
        | 'video'
        | 'table'
        | 'media-text'
        | 'scene-scrolly'
        | 'link-list';
    }
  >;
}

function parseFlourishMarker(text: string) {
  const match = text.match(/^\[\[flourish:(.+)\]\]$/i);
  if (!match) return null;

  const dataSrc = match[1]?.trim();
  if (!dataSrc) return null;

  return {
    type: 'flourish' as const,
    embedType: 'chart' as const,
    dataSrc,
    alt: 'Flourish visualisation',
  };
}

function imageBlockFromNode(node: ProseMirrorNode) {
  const src = String(node.attrs?.src ?? '').trim();
  if (!src) return null;
  if (/\.mp4($|\?)/i.test(src)) {
    return {
      type: 'video' as const,
      video: {
        src,
        ...(String(node.attrs?.poster ?? '').trim()
          ? { poster: String(node.attrs?.poster ?? '').trim() }
          : {}),
        ...(String(node.attrs?.captions ?? '').trim()
          ? { captions: String(node.attrs?.captions ?? '').trim() }
          : {}),
        caption: String(node.attrs?.caption ?? '').trim() || null,
        credit: String(node.attrs?.credit ?? '').trim() || null,
      },
    };
  }

  return {
    type: 'image' as const,
    image: {
      src,
      alt: String(node.attrs?.alt ?? '').trim() || 'Image',
      caption: String(node.attrs?.caption ?? '').trim() || null,
      credit: String(node.attrs?.credit ?? '').trim() || null,
    },
    layout:
      (String(node.attrs?.layout ?? '').trim() as
        | 'inline'
        | 'wide'
        | 'full'
        | 'portrait') || 'inline',
  };
}

function videoBlockFromNode(
  node: ProseMirrorNode,
): Extract<StoryBlock, { type: 'video' }> | null {
  const src = String(node.attrs?.src ?? '').trim();
  if (!src) return null;

  return {
    type: 'video',
    video: {
      src,
      ...(String(node.attrs?.poster ?? '').trim()
        ? { poster: String(node.attrs?.poster ?? '').trim() }
        : {}),
      ...(String(node.attrs?.captions ?? '').trim()
        ? { captions: String(node.attrs?.captions ?? '').trim() }
        : {}),
      ...(typeof node.attrs?.autoplay === 'boolean'
        ? { autoplay: Boolean(node.attrs.autoplay) }
        : {}),
      caption: String(node.attrs?.caption ?? '').trim() || null,
      credit: String(node.attrs?.credit ?? '').trim() || null,
    },
  };
}

function mediaTextBlockFromNode(
  node: ProseMirrorNode,
): Extract<StoryBlock, { type: 'media-text' }> | null {
  const src = String(node.attrs?.src ?? '').trim();
  if (!src) return null;
  const mediaSide: 'left' | 'right' =
    String(node.attrs?.mediaSide ?? '').trim() === 'left' ? 'left' : 'right';
  const mediaType = String(node.attrs?.mediaType ?? '').trim() === 'video' ? 'video' : 'image';

  const paragraphs = Array.isArray(node.attrs?.paragraphs)
    ? (node.attrs?.paragraphs as unknown[])
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .map((value) => escapeHtml(value))
    : [];

  return {
    type: 'media-text' as const,
    ...(String(node.attrs?.eyebrow ?? '').trim()
      ? { eyebrow: String(node.attrs?.eyebrow ?? '').trim() }
      : {}),
    ...(String(node.attrs?.heading ?? '').trim()
      ? { heading: String(node.attrs?.heading ?? '').trim() }
      : {}),
    paragraphs: paragraphs.length ? paragraphs : [''],
    media: {
      type: mediaType,
      asset:
        mediaType === 'video'
          ? {
              src,
              ...(String(node.attrs?.poster ?? '').trim()
                ? { poster: String(node.attrs?.poster ?? '').trim() }
                : {}),
              ...(String(node.attrs?.captions ?? '').trim()
                ? { captions: String(node.attrs?.captions ?? '').trim() }
                : {}),
              caption: String(node.attrs?.caption ?? '').trim() || null,
              credit: String(node.attrs?.credit ?? '').trim() || null,
            }
          : {
              src,
              alt: String(node.attrs?.alt ?? '').trim() || 'Image',
              caption: String(node.attrs?.caption ?? '').trim() || null,
              credit: String(node.attrs?.credit ?? '').trim() || null,
            },
    },
    mediaSide,
  };
}

function sceneScrollyBlockFromNode(
  node: ProseMirrorNode,
): Extract<StoryBlock, { type: 'scene-scrolly' }> | null {
  const stepsSource = Array.isArray(node.attrs?.steps)
    ? (node.attrs?.steps as unknown[])
    : [];

  const steps = stepsSource
    .map((step) => {
      const item = (step ?? {}) as Record<string, unknown>;
      const title = String(item.title ?? '').trim();
      const body = String(item.body ?? '').trim();
      const imageSrc = String(item.imageSrc ?? '').trim();
      const imageAlt = String(item.imageAlt ?? '').trim();
      const mediaType = String(item.mediaType ?? '').trim() === 'video' ? 'video' : 'image';
      const videoSrc = String(item.videoSrc ?? '').trim();

      if (!title || !body) return null;
      if (mediaType === 'video' ? !videoSrc : !imageSrc) return null;

      const focusX = Number(item.focusX);
      const focusY = Number(item.focusY);
      const focusScale = Number(item.focusScale);

      return {
        ...(String(item.eyebrow ?? '').trim()
          ? { eyebrow: String(item.eyebrow ?? '').trim() }
          : {}),
        title,
        body,
        image: {
          src: imageSrc || String(item.poster ?? '').trim() || '',
          alt: imageAlt || 'Scene image',
          caption: String(item.caption ?? '').trim() || null,
          credit: String(item.credit ?? '').trim() || null,
        },
        ...(mediaType === 'video' && videoSrc
          ? {
              video: {
                src: videoSrc,
                ...(String(item.poster ?? '').trim()
                  ? { poster: String(item.poster ?? '').trim() }
                  : {}),
                ...(String(item.captions ?? '').trim()
                  ? { captions: String(item.captions ?? '').trim() }
                  : {}),
                caption: String(item.caption ?? '').trim() || null,
                credit: String(item.credit ?? '').trim() || null,
              },
            }
          : {}),
        ...(String(item.placeLabel ?? '').trim()
          ? { placeLabel: String(item.placeLabel ?? '').trim() }
          : {}),
        ...(String(item.overlayPosition ?? '').trim()
          ? {
              overlayPosition: String(item.overlayPosition ?? '').trim() as
                | 'left-lower'
                | 'right-lower'
                | 'left-upper'
                | 'right-upper'
                | 'left-center'
                | 'right-center',
            }
          : {}),
        ...(Number.isFinite(focusX) && Number.isFinite(focusY)
          ? {
              focus: {
                x: focusX,
                y: focusY,
                ...(Number.isFinite(focusScale) ? { scale: focusScale } : {}),
              },
            }
          : {}),
      };
    })
    .filter(Boolean) as Extract<StoryBlock, { type: 'scene-scrolly' }>['steps'];

  if (!steps.length) return null;

  return {
    type: 'scene-scrolly',
    ...(String(node.attrs?.title ?? '').trim()
      ? { title: String(node.attrs?.title ?? '').trim() }
      : {}),
    ...(String(node.attrs?.intro ?? '').trim()
      ? { intro: String(node.attrs?.intro ?? '').trim() }
      : {}),
    steps,
  };
}

function flourishBlockFromNode(node: ProseMirrorNode) {
  const dataSrc = String(node.attrs?.dataSrc ?? '').trim();
  if (!dataSrc) return null;

  const width = String(node.attrs?.width ?? '').trim();
  const embedType = String(node.attrs?.embedType ?? '').trim();

  return {
    type: 'flourish' as const,
    dataSrc,
    alt: String(node.attrs?.alt ?? '').trim() || 'Flourish visualisation',
    ...(String(node.attrs?.thumbnail ?? '').trim()
      ? { thumbnail: String(node.attrs?.thumbnail ?? '').trim() }
      : {}),
    ...(String(node.attrs?.caption ?? '').trim()
      ? { caption: String(node.attrs?.caption ?? '').trim() }
      : {}),
    ...(embedType === 'story' || embedType === 'visualisation' || embedType === 'chart'
      ? { embedType: embedType as 'chart' | 'story' | 'visualisation' }
      : {}),
    ...(width === 'prose' || width === 'wide'
      ? { width: width as 'prose' | 'wide' }
      : {}),
  };
}

function tableBlockFromNode(node: ProseMirrorNode) {
  const html = String(node.attrs?.html ?? '').trim();
  if (!html) return null;

  return {
    type: 'table' as const,
    html,
  };
}

function linkListBlockFromNode(
  node: ProseMirrorNode,
): Extract<StoryBlock, { type: 'link-list' }> | null {
  const linksSource = Array.isArray(node.attrs?.links)
    ? (node.attrs?.links as unknown[])
    : [];

  const links = linksSource
    .map((item) => {
      const link = (item ?? {}) as Record<string, unknown>;
      const label = String(link.label ?? '').trim();
      const href = String(link.href ?? '').trim();
      const description = String(link.description ?? '').trim();

      if (!label || !href) return null;

      return {
        label,
        href,
        ...(description ? { description } : {}),
      };
    })
    .filter(Boolean) as Extract<StoryBlock, { type: 'link-list' }>['links'];

  if (!links.length) return null;

  return {
    type: 'link-list',
    ...(String(node.attrs?.eyebrow ?? '').trim()
      ? { eyebrow: String(node.attrs?.eyebrow ?? '').trim() }
      : {}),
    ...(String(node.attrs?.heading ?? '').trim()
      ? { heading: String(node.attrs?.heading ?? '').trim() }
      : {}),
    links,
  };
}

export function proseMirrorToCommitteeNodes(
  document: ProseMirrorDocument,
): CommitteeReportNode[] {
  const nodes: CommitteeReportNode[] = [];

  for (const node of document.content ?? []) {
    if (node.type === 'heading') {
      const text = renderInline(node);
      if (!stripHtml(text)) continue;

      nodes.push({
        type: 'heading',
        level: Number(node.attrs?.level ?? 1),
        text,
      });
      continue;
    }

    if (node.type === 'paragraph') {
      const text = renderInline(node);
      if (!stripHtml(text) && !text.includes('<br>')) continue;

      const flourish = parseFlourishMarker(stripHtml(text));
      if (flourish) {
        nodes.push({
          type: 'flourish',
          text,
          block: flourish,
        });
        continue;
      }

      const previous = nodes.at(-1);
      if (
        previous?.type === 'paragraph' &&
        isOrderedListHtml(previous.text) &&
        !endsWithSentencePunctuation(previous.text)
      ) {
        const merged = appendParagraphToLastListItem(previous.text, text);
        if (merged) {
          previous.text = merged;
          continue;
        }
      }

      nodes.push({
        type: 'paragraph',
        text,
      });
      continue;
    }

    if (node.type === 'orderedList' || node.type === 'bulletList') {
      const listHtml = renderList(node);
      const previous = nodes.at(-1);

      if (
        node.type === 'orderedList' &&
        previous?.type === 'paragraph' &&
        isOrderedListHtml(previous.text)
      ) {
        const merged = mergeOrderedListHtml(previous.text, listHtml);
        if (merged) {
          previous.text = merged;
          continue;
        }
      }

      nodes.push({
        type: 'paragraph',
        text: listHtml,
      });
      continue;
    }

    if (node.type === 'flourishBlock') {
      const block = flourishBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'flourish',
        text: block.caption ?? block.alt ?? block.dataSrc,
        block,
      });
      continue;
    }

    if (node.type === 'mediaTextBlock') {
      const block = mediaTextBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'media-text',
        text: block.heading ?? block.paragraphs[0] ?? 'Media/text block',
        block,
      });
      continue;
    }

    if (node.type === 'sceneScrollyBlock') {
      const block = sceneScrollyBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'scene-scrolly',
        text: block.title ?? block.steps[0]?.title ?? 'Scrollytelling section',
        block,
      });
      continue;
    }

    if (node.type === 'imageBlock') {
      const block = imageBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: block.type === 'video' ? 'video' : 'image',
        text:
          block.type === 'video'
            ? block.video.caption ?? block.video.src
            : block.image.alt,
        block,
      });
      continue;
    }

    if (node.type === 'videoBlock') {
      const block = videoBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'video',
        text: block.video.caption ?? block.video.src,
        block,
      });
      continue;
    }

    if (node.type === 'tableBlock') {
      const block = tableBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'table',
        text: 'Table',
        block,
      });
      continue;
    }

    if (node.type === 'linkListBlock') {
      const block = linkListBlockFromNode(node);
      if (!block) continue;

      nodes.push({
        type: 'link-list',
        text: block.eyebrow ?? block.heading ?? 'Explore further',
        block,
      });
    }
  }

  return nodes;
}

export function proseMirrorToNarrativeBlocks(
  document: ProseMirrorDocument,
  options: { title?: string } = {},
): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  let currentHeading: string | undefined;
  let currentHeadingLevel: 2 | 3 = 2;
  let currentParagraphs: string[] = [];
  let encounteredBodyContent = false;

  const normalizedTitle = options.title
    ?.replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  function flush() {
    if (!currentHeading && currentParagraphs.length === 0) return;

    blocks.push({
      type: 'text',
      heading: currentHeading,
      headingLevel: currentHeading ? currentHeadingLevel : undefined,
      paragraphs: currentParagraphs,
    });

    currentHeading = undefined;
    currentHeadingLevel = 2;
    currentParagraphs = [];
  }

  for (const node of document.content ?? []) {
    if (node.type === 'heading') {
      const heading = stripHtml(renderInline(node));
      const level = Number(node.attrs?.level ?? 1);
      const normalizedHeading = heading.replace(/\s+/g, ' ').trim().toLowerCase();

      if (
        !encounteredBodyContent &&
        level === 1 &&
        (!normalizedTitle || normalizedHeading === normalizedTitle)
      ) {
        continue;
      }

      flush();
      currentHeading = heading;
      currentHeadingLevel = level > 2 ? 3 : 2;
      continue;
    }

    if (node.type === 'paragraph') {
      const html = renderInline(node);
      if (!stripHtml(html) && !html.includes('<br>')) continue;

      const flourish = parseFlourishMarker(stripHtml(html));
      if (flourish) {
        flush();
        blocks.push(flourish);
        encounteredBodyContent = true;
        continue;
      }

      encounteredBodyContent = true;
      currentParagraphs.push(html);
      continue;
    }

    if (node.type === 'bulletList' || node.type === 'orderedList') {
      encounteredBodyContent = true;
      currentParagraphs.push(renderList(node));
      continue;
    }

    if (node.type === 'flourishBlock') {
      const flourish = flourishBlockFromNode(node);
      if (!flourish) continue;

      flush();
      blocks.push(flourish);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'mediaTextBlock') {
      const mediaText = mediaTextBlockFromNode(node);
      if (!mediaText) continue;

      flush();
      blocks.push(mediaText);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'sceneScrollyBlock') {
      const sceneScrolly = sceneScrollyBlockFromNode(node);
      if (!sceneScrolly) continue;

      flush();
      blocks.push(sceneScrolly);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'imageBlock') {
      const image = imageBlockFromNode(node);
      if (!image) continue;

      flush();
      blocks.push(image);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'videoBlock') {
      const video = videoBlockFromNode(node);
      if (!video) continue;

      flush();
      blocks.push(video);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'tableBlock') {
      const table = tableBlockFromNode(node);
      if (!table) continue;

      flush();
      blocks.push(table);
      encounteredBodyContent = true;
      continue;
    }

    if (node.type === 'linkListBlock') {
      const linkList = linkListBlockFromNode(node);
      if (!linkList) continue;

      flush();
      blocks.push(linkList);
      encounteredBodyContent = true;
    }
  }

  flush();

  return blocks;
}
