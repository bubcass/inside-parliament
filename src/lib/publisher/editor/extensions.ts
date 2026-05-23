import { mergeAttributes, Node } from '@tiptap/core';

function decodeHtmlAttribute(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseParagraphList(value: string) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(decodeHtmlAttribute(value));
    return Array.isArray(parsed) ? parsed.map((item) => String(item ?? '')) : [];
  } catch {
    return decodeHtmlAttribute(value)
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function encodeParagraphList(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  return encodeURIComponent(JSON.stringify(source.map((item) => String(item ?? ''))));
}

function parseJsonAttribute<T>(value: string, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(decodeHtmlAttribute(value)) as T;
  } catch {
    return fallback;
  }
}

function encodeJsonAttribute(value: unknown) {
  return encodeURIComponent(JSON.stringify(value ?? null));
}

export const ImageBlock = Node.create({
  name: 'imageBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-src') || '',
        renderHTML: (attributes) => ({ 'data-src': attributes.src || '' }),
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-alt') || '',
        renderHTML: (attributes) => ({ 'data-alt': attributes.alt || '' }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption || '',
        }),
      },
      credit: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-credit') || '',
        renderHTML: (attributes) => ({ 'data-credit': attributes.credit || '' }),
      },
      layout: {
        default: 'inline',
        parseHTML: (element) => element.getAttribute('data-layout') || 'inline',
        renderHTML: (attributes) => ({
          'data-layout': attributes.layout || 'inline',
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'stor-image' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'stor-image',
      mergeAttributes(HTMLAttributes, {
        class: `stor-embedded-block stor-embedded-block--image stor-embedded-block--${
          node.attrs.layout || 'inline'
        }`,
      }),
      ['div', { class: 'stor-embedded-block__eyebrow' }, 'Image'],
      ['p', { class: 'stor-embedded-block__text' }, node.attrs.alt || 'Image'],
      [
        'p',
        { class: 'stor-embedded-block__meta' },
        node.attrs.src || 'No image path selected',
      ],
      ...(node.attrs.caption
        ? [['p', { class: 'stor-embedded-block__meta' }, node.attrs.caption]]
        : []),
    ];
  },
});

export const FlourishBlock = Node.create({
  name: 'flourishBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      dataSrc: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-src') || '',
        renderHTML: (attributes) => ({ 'data-src': attributes.dataSrc || '' }),
      },
      alt: {
        default: 'Flourish visualisation',
        parseHTML: (element) =>
          element.getAttribute('data-alt') || 'Flourish visualisation',
        renderHTML: (attributes) => ({ 'data-alt': attributes.alt || '' }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption || '',
        }),
      },
      thumbnail: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-thumbnail') || '',
        renderHTML: (attributes) => ({
          'data-thumbnail': attributes.thumbnail || '',
        }),
      },
      embedType: {
        default: 'chart',
        parseHTML: (element) => element.getAttribute('data-embed-type') || 'chart',
        renderHTML: (attributes) => ({
          'data-embed-type': attributes.embedType || 'chart',
        }),
      },
      width: {
        default: 'wide',
        parseHTML: (element) => element.getAttribute('data-width') || 'wide',
        renderHTML: (attributes) => ({ 'data-width': attributes.width || 'wide' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'stor-flourish' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'stor-flourish',
      mergeAttributes(HTMLAttributes, {
        class: 'stor-embedded-block stor-embedded-block--flourish',
      }),
      ['div', { class: 'stor-embedded-block__eyebrow' }, 'Flourish'],
      [
        'p',
        { class: 'stor-embedded-block__text' },
        node.attrs.caption || node.attrs.alt || 'Flourish visualisation',
      ],
      [
        'p',
        { class: 'stor-embedded-block__meta' },
        node.attrs.dataSrc || 'No Flourish source selected',
      ],
    ];
  },
});

export const MediaTextBlock = Node.create({
  name: 'mediaTextBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      eyebrow: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-eyebrow') || '',
        renderHTML: (attributes) => ({ 'data-eyebrow': attributes.eyebrow || '' }),
      },
      heading: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-heading') || '',
        renderHTML: (attributes) => ({ 'data-heading': attributes.heading || '' }),
      },
      paragraphs: {
        default: [],
        parseHTML: (element) =>
          parseParagraphList(element.getAttribute('data-paragraphs') || ''),
        renderHTML: (attributes) => ({
          'data-paragraphs': encodeParagraphList(attributes.paragraphs),
        }),
      },
      mediaType: {
        default: 'image',
        parseHTML: (element) => element.getAttribute('data-media-type') || 'image',
        renderHTML: (attributes) => ({
          'data-media-type': attributes.mediaType || 'image',
        }),
      },
      poster: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-poster') || '',
        renderHTML: (attributes) => ({ 'data-poster': attributes.poster || '' }),
      },
      captions: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-captions') || '',
        renderHTML: (attributes) => ({
          'data-captions': attributes.captions || '',
        }),
      },
      mediaSide: {
        default: 'right',
        parseHTML: (element) => element.getAttribute('data-media-side') || 'right',
        renderHTML: (attributes) => ({
          'data-media-side': attributes.mediaSide || 'right',
        }),
      },
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-src') || '',
        renderHTML: (attributes) => ({ 'data-src': attributes.src || '' }),
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-alt') || '',
        renderHTML: (attributes) => ({ 'data-alt': attributes.alt || '' }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption || '',
        }),
      },
      credit: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-credit') || '',
        renderHTML: (attributes) => ({ 'data-credit': attributes.credit || '' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'stor-media-text' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const paragraphs = parseParagraphList(String(node.attrs.paragraphs ?? ''));
    return [
      'stor-media-text',
      mergeAttributes(HTMLAttributes, {
        class: `stor-embedded-block stor-embedded-block--media-text stor-embedded-block--media-${node.attrs.mediaSide || 'right'}`,
      }),
      ['div', { class: 'stor-embedded-block__eyebrow' }, 'Media/text split'],
      [
        'p',
        { class: 'stor-embedded-block__text' },
        node.attrs.heading || paragraphs[0] || 'Media/text block',
      ],
      [
        'p',
        { class: 'stor-embedded-block__meta' },
        `${node.attrs.mediaType === 'video' ? 'Video' : 'Image'} · ${
          node.attrs.mediaSide === 'left' ? 'Media left' : 'Media right'
        } · ${node.attrs.src || 'No media selected'}`,
      ],
      ...(node.attrs.caption
        ? [['p', { class: 'stor-embedded-block__meta' }, node.attrs.caption]]
        : []),
    ];
  },
});

export const SceneScrollyBlock = Node.create({
  name: 'sceneScrollyBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({ 'data-title': attributes.title || '' }),
      },
      intro: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-intro') || '',
        renderHTML: (attributes) => ({ 'data-intro': attributes.intro || '' }),
      },
      steps: {
        default: [],
        parseHTML: (element) =>
          parseJsonAttribute(element.getAttribute('data-steps') || '', []),
        renderHTML: (attributes) => ({
          'data-steps': encodeJsonAttribute(attributes.steps),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'stor-scene-scrolly' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const steps = Array.isArray(node.attrs.steps) ? node.attrs.steps : [];
    const firstStep = steps[0] as Record<string, unknown> | undefined;
    const visibleSteps = steps.slice(0, 3).map((step) => {
      const item = (step ?? {}) as Record<string, unknown>;
      const title = String(item.title ?? '').trim() || 'Untitled step';
      const mediaType = String(item.mediaType ?? '') === 'video' ? 'Video' : 'Image';
      return ['li', { class: 'stor-embedded-block__step' }, `${title} · ${mediaType}`];
    });
    const remainingCount = steps.length > 3 ? steps.length - 3 : 0;

    return [
      'stor-scene-scrolly',
      mergeAttributes(HTMLAttributes, {
        class: 'stor-embedded-block stor-embedded-block--scene-scrolly',
      }),
      ['div', { class: 'stor-embedded-block__eyebrow' }, 'Scrollytelling section'],
      [
        'p',
        { class: 'stor-embedded-block__text' },
        node.attrs.title || firstStep?.title || 'Scrollytelling section',
      ],
      [
        'p',
        { class: 'stor-embedded-block__meta' },
        `${steps.length} step${steps.length === 1 ? '' : 's'}`,
      ],
      ...(node.attrs.intro
        ? [['p', { class: 'stor-embedded-block__meta' }, node.attrs.intro]]
        : []),
      ...(visibleSteps.length
        ? [['ol', { class: 'stor-embedded-block__steps' }, ...visibleSteps]]
        : []),
      ...(remainingCount > 0
        ? [['p', { class: 'stor-embedded-block__meta' }, `+ ${remainingCount} more step${remainingCount === 1 ? '' : 's'}`]]
        : []),
    ];
  },
});

function summarizeTable(html: string) {
  const rowCount = (html.match(/<tr\b/gi) || []).length;
  const headerCount = (html.match(/<th\b/gi) || []).length;
  const cellCount = (html.match(/<td\b/gi) || []).length + headerCount;
  return { rowCount, cellCount };
}

export const TableBlock = Node.create({
  name: 'tableBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (element) =>
          decodeHtmlAttribute(element.getAttribute('data-html') || ''),
        renderHTML: (attributes) => ({
          'data-html': encodeURIComponent(attributes.html || ''),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'stor-table' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const summary = summarizeTable(String(node.attrs.html || ''));

    return [
      'stor-table',
      mergeAttributes(HTMLAttributes, {
        class: 'stor-embedded-block stor-embedded-block--table',
      }),
      ['div', { class: 'stor-embedded-block__eyebrow' }, 'Table'],
      [
        'p',
        { class: 'stor-embedded-block__text' },
        `${summary.rowCount} rows, ${summary.cellCount} cells`,
      ],
      ['p', { class: 'stor-embedded-block__meta' }, 'Imported from DOCX table markup'],
    ];
  },
});

export interface StructuredBlockSelection {
  type:
    | 'imageBlock'
    | 'flourishBlock'
    | 'tableBlock'
    | 'mediaTextBlock'
    | 'sceneScrollyBlock';
  attrs: Record<string, unknown>;
  from: number;
  to: number;
}

export function getSelectedStructuredBlock(editor: {
  state: {
    selection: {
      from: number;
      to: number;
      node?: { type: { name: string }; attrs?: Record<string, unknown> } | null;
      $from: {
        nodeAfter?: {
          type: { name: string };
          attrs?: Record<string, unknown>;
          nodeSize: number;
        } | null;
      };
    };
  };
}) {
  const { selection } = editor.state;
  const selectedNode = selection.node;

  if (
    selectedNode &&
    (selectedNode.type.name === 'imageBlock' ||
      selectedNode.type.name === 'flourishBlock' ||
      selectedNode.type.name === 'tableBlock' ||
      selectedNode.type.name === 'mediaTextBlock' ||
      selectedNode.type.name === 'sceneScrollyBlock')
  ) {
    return {
      type: selectedNode.type.name,
      attrs: selectedNode.attrs || {},
      from: selection.from,
      to: selection.to,
    } as StructuredBlockSelection;
  }

  const nodeAfter = selection.$from.nodeAfter;
  if (
    nodeAfter &&
    (nodeAfter.type.name === 'imageBlock' ||
      nodeAfter.type.name === 'flourishBlock' ||
      nodeAfter.type.name === 'tableBlock' ||
      nodeAfter.type.name === 'mediaTextBlock' ||
      nodeAfter.type.name === 'sceneScrollyBlock')
  ) {
    return {
      type: nodeAfter.type.name,
      attrs: nodeAfter.attrs || {},
      from: selection.from,
      to: selection.from + nodeAfter.nodeSize,
    } as StructuredBlockSelection;
  }

  return null;
}
