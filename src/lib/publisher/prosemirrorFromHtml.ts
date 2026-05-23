import type {
  ProseMirrorDocument,
  ProseMirrorMark,
  ProseMirrorNode,
} from '$lib/content/stor/types';

function cloneMarks(marks: ProseMirrorMark[]) {
  return marks.map((mark): ProseMirrorMark =>
    mark.attrs ? { type: mark.type, attrs: { ...mark.attrs } } : { type: mark.type },
  );
}

function textNode(text: string, marks: ProseMirrorMark[] = []): ProseMirrorNode {
  return marks.length ? { type: 'text', text, marks } : { type: 'text', text };
}

function parseInlineNode(
  node: Node,
  marks: ProseMirrorMark[],
  document: Document,
): ProseMirrorNode[] {
  if (node.nodeType === document.TEXT_NODE) {
    const value = node.textContent ?? '';
    if (!value) return [];
    return [textNode(value, cloneMarks(marks))];
  }

  if (node.nodeType !== document.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (tag === 'br') {
    return [{ type: 'hardBreak' }];
  }

  const nextMarks = cloneMarks(marks);

  if (tag === 'strong' || tag === 'b') {
    nextMarks.push({ type: 'bold' });
  } else if (tag === 'em' || tag === 'i') {
    nextMarks.push({ type: 'italic' });
  } else if (tag === 'u') {
    nextMarks.push({ type: 'underline' });
  } else if (tag === 's' || tag === 'strike') {
    nextMarks.push({ type: 'strike' });
  } else if (tag === 'sup') {
    nextMarks.push({ type: 'superscript' });
  } else if (tag === 'sub') {
    nextMarks.push({ type: 'subscript' });
  } else if (tag === 'code') {
    nextMarks.push({ type: 'code' });
  } else if (tag === 'a') {
    nextMarks.push({
      type: 'link',
      attrs: {
        href: element.getAttribute('href') ?? '',
        target: element.getAttribute('target') ?? '_blank',
        rel: element.getAttribute('rel') ?? 'noopener noreferrer nofollow',
        class: element.getAttribute('class'),
      },
    });
  }

  return Array.from(element.childNodes).flatMap((child) =>
    parseInlineNode(child, nextMarks, document),
  );
}

function normalizeInline(content: ProseMirrorNode[]) {
  return content.filter((node) => {
    if (node.type !== 'text') return true;
    return Boolean(node.text && node.text.length);
  });
}

function paragraphFromElement(
  element: HTMLElement,
  document: Document,
): ProseMirrorNode | null {
  const content = normalizeInline(
    Array.from(element.childNodes).flatMap((child) =>
      parseInlineNode(child, [], document),
    ),
  );

  if (!content.length) return null;

  return {
    type: 'paragraph',
    attrs: { textAlign: null },
    content,
  };
}

function listItemFromElement(
  element: HTMLElement,
  document: Document,
): ProseMirrorNode | null {
  const content: ProseMirrorNode[] = [];

  const inlineChildren = Array.from(element.childNodes).filter((child) => {
    return !(
      child.nodeType === document.ELEMENT_NODE &&
      ['ul', 'ol'].includes((child as HTMLElement).tagName.toLowerCase())
    );
  });

  const paragraph = paragraphFromElement(
    Object.assign(document.createElement('div'), {
      innerHTML: inlineChildren
        .map((child) =>
          child.nodeType === document.TEXT_NODE
            ? child.textContent ?? ''
            : (child as HTMLElement).outerHTML,
        )
        .join(''),
    }),
    document,
  );

  if (paragraph) {
    content.push(paragraph);
  }

  for (const child of Array.from(element.children)) {
    const tag = child.tagName.toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      const list = listFromElement(child as HTMLElement, document);
      if (list) content.push(list);
    }
  }

  if (!content.length) return null;

  return {
    type: 'listItem',
    content,
  };
}

function listFromElement(
  element: HTMLElement,
  document: Document,
): ProseMirrorNode | null {
  const tag = element.tagName.toLowerCase();
  const content = Array.from(element.children)
    .filter((child) => child.tagName.toLowerCase() === 'li')
    .map((child) => listItemFromElement(child as HTMLElement, document))
    .filter((child): child is ProseMirrorNode => Boolean(child));

  if (!content.length) return null;

  return {
    type: tag === 'ol' ? 'orderedList' : 'bulletList',
    attrs: tag === 'ol' ? { start: 1 } : undefined,
    content,
  };
}

function blockFromElement(
  element: HTMLElement,
  document: Document,
): ProseMirrorNode[] {
  const tag = element.tagName.toLowerCase();

  if (tag === 'p') {
    const paragraph = paragraphFromElement(element, document);
    return paragraph ? [paragraph] : [];
  }

  if (tag.match(/^h[1-6]$/)) {
    const level = Number(tag.slice(1));
    const content = normalizeInline(
      Array.from(element.childNodes).flatMap((child) =>
        parseInlineNode(child, [], document),
      ),
    );

    if (!content.length) return [];

    return [
      {
        type: 'heading',
        attrs: { textAlign: null, level },
        content,
      },
    ];
  }

  if (tag === 'ul' || tag === 'ol') {
    const list = listFromElement(element, document);
    return list ? [list] : [];
  }

  if (tag === 'blockquote') {
    const paragraphs = Array.from(element.querySelectorAll(':scope > p')).flatMap((child) =>
      blockFromElement(child as HTMLElement, document),
    );

    return paragraphs.length ? [{ type: 'blockquote', content: paragraphs }] : [];
  }

  if (tag === 'div' || tag === 'section' || tag === 'article') {
    return Array.from(element.children).flatMap((child) =>
      blockFromElement(child as HTMLElement, document),
    );
  }

  const paragraph = paragraphFromElement(element, document);
  return paragraph ? [paragraph] : [];
}

export function proseMirrorFromHtml(html: string): ProseMirrorDocument {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const content = Array.from(document.body.children).flatMap((child) =>
    blockFromElement(child as HTMLElement, document),
  );

  return {
    type: 'doc',
    content,
  };
}
