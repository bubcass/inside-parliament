import type {
  ProseMirrorDocument,
  ProseMirrorMark,
  ProseMirrorNode,
  StorContributor,
  StorDocument,
} from './types';

function esc(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugifyTitle(title = '') {
  return (
    String(title)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase()
      .slice(0, 60) || 'section'
  );
}

function makeUniqueIdFactory() {
  const used = new Set<string>();

  return (base: string) => {
    let id = base || 'section';
    if (!used.has(id)) {
      used.add(id);
      return id;
    }

    let counter = 2;
    while (used.has(`${id}-${counter}`)) counter += 1;
    id = `${id}-${counter}`;
    used.add(id);
    return id;
  };
}

function inlineText(node: ProseMirrorNode): string {
  if (node.type === 'text') {
    let output = esc(node.text ?? '');

    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case 'bold':
          output = `<emphasis role="strong">${output}</emphasis>`;
          break;
        case 'italic':
          output = `<emphasis>${output}</emphasis>`;
          break;
        case 'underline':
          output = `<emphasis role="underline">${output}</emphasis>`;
          break;
        case 'strike':
          output = `<emphasis role="strikethrough">${output}</emphasis>`;
          break;
        case 'code':
          output = `<code>${output}</code>`;
          break;
        case 'superscript':
          output = `<superscript>${output}</superscript>`;
          break;
        case 'subscript':
          output = `<subscript>${output}</subscript>`;
          break;
        case 'link':
          if (mark.attrs?.href) {
            output = `<ulink url="${esc(mark.attrs.href)}">${output}</ulink>`;
          }
          break;
      }
    }

    return output;
  }

  if (node.type === 'hardBreak') return '&#10;';
  return (node.content ?? []).map(inlineText).join('');
}

function plainText(node: ProseMirrorNode): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  return (node.content ?? []).map(plainText).join('');
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function paragraphPlainText(node: ProseMirrorNode) {
  return normalizeWhitespace(plainText(node));
}

function paragraphHasSubstance(node: ProseMirrorNode) {
  return paragraphPlainText(node).length > 0;
}

function paragraphLooksLikeContentsHeading(node: ProseMirrorNode) {
  return paragraphPlainText(node).toLowerCase() === 'contents';
}

function nodeHasInternalLink(node: ProseMirrorNode): boolean {
  if (node.marks?.some((mark) => mark.type === 'link' && String(mark.attrs?.href ?? '').startsWith('#'))) {
    return true;
  }

  return (node.content ?? []).some((child) => nodeHasInternalLink(child));
}

function paragraphLooksLikeTocEntry(node: ProseMirrorNode) {
  const text = paragraphPlainText(node);
  return nodeHasInternalLink(node) && /\d+$/.test(text);
}

function serializeParagraph(node: ProseMirrorNode) {
  return `<para>${inlineText(node)}</para>`;
}

function serializeList(node: ProseMirrorNode): string {
  const tag = node.type === 'orderedList' ? 'orderedlist' : 'itemizedlist';
  const items = (node.content ?? [])
    .map((item) => {
      const body = (item.content ?? [])
        .map((child) => {
          if (child.type === 'paragraph') return serializeParagraph(child);
          if (child.type === 'bulletList' || child.type === 'orderedList') return serializeList(child);
          return serializeStandaloneNode(child);
        })
        .join('');

      return `<listitem>${body}</listitem>`;
    })
    .join('');

  return `<${tag}>${items}</${tag}>`;
}

function serializeHtmlChildren(node: Node, document: Document): string {
  if (node.nodeType === document.TEXT_NODE) {
    return esc(node.textContent ?? '');
  }

  if (node.nodeType !== document.ELEMENT_NODE) return '';

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map((child) => serializeHtmlChildren(child, document))
    .join('');

  switch (tag) {
    case 'br':
      return '&#10;';
    case 'a':
      return `<ulink url="${esc(element.getAttribute('href') ?? '')}">${children}</ulink>`;
    case 'strong':
    case 'b':
      return `<emphasis role="strong">${children}</emphasis>`;
    case 'em':
    case 'i':
      return `<emphasis>${children}</emphasis>`;
    case 'u':
      return `<emphasis role="underline">${children}</emphasis>`;
    case 'code':
      return `<code>${children}</code>`;
    case 'sup':
      return `<superscript>${children}</superscript>`;
    case 'sub':
      return `<subscript>${children}</subscript>`;
    case 'p':
      return `<para>${children}</para>`;
    case 'ul':
      return `<itemizedlist>${children}</itemizedlist>`;
    case 'ol':
      return `<orderedlist>${children}</orderedlist>`;
    case 'li':
      return `<listitem><para>${children}</para></listitem>`;
    default:
      return children;
  }
}

function serializeTableHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const table = document.querySelector('table');
  if (!table) return '';

  const rows = Array.from(table.querySelectorAll('tr'));
  const columnCount = Math.max(
    1,
    ...rows.map((row) =>
      Array.from(row.children).reduce((sum, cell) => {
        const colspan = Number.parseInt(cell.getAttribute('colspan') ?? '1', 10);
        return sum + (Number.isFinite(colspan) ? colspan : 1);
      }, 0),
    ),
  );

  const headRows = Array.from(table.querySelectorAll('thead > tr'));
  const bodyRows =
    table.querySelectorAll('tbody > tr').length > 0
      ? Array.from(table.querySelectorAll('tbody > tr'))
      : rows.slice(headRows.length);

  const serializeRow = (row: HTMLTableRowElement) => {
    const cells = Array.from(row.children)
      .map((cell) => {
        const attrs: string[] = [];
        const colspan = cell.getAttribute('colspan');
        const rowspan = cell.getAttribute('rowspan');
        if (colspan) attrs.push(`namest="c1" nameend="c${esc(colspan)}"`);
        if (rowspan) attrs.push(`morerows="${Math.max(0, Number.parseInt(rowspan, 10) - 1)}"`);
        const content = Array.from(cell.childNodes)
          .map((child) => serializeHtmlChildren(child, document))
          .join('');
        return `<entry${attrs.length ? ` ${attrs.join(' ')}` : ''}>${content}</entry>`;
      })
      .join('');
    return `<row>${cells}</row>`;
  };

  const thead = headRows.length
    ? `<thead>${headRows.map((row) => serializeRow(row as HTMLTableRowElement)).join('')}</thead>`
    : '';
  const tbody = `<tbody>${bodyRows.map((row) => serializeRow(row as HTMLTableRowElement)).join('')}</tbody>`;

  return `<table><tgroup cols="${columnCount}">${thead}${tbody}</tgroup></table>`;
}

function serializeImageBlock(node: ProseMirrorNode) {
  const src = esc(String(node.attrs?.src ?? ''));
  const alt = esc(String(node.attrs?.alt ?? ''));
  const layout = esc(String(node.attrs?.layout ?? 'inline'));
  const caption = node.attrs?.caption ? `<title>${esc(String(node.attrs.caption))}</title>` : '';
  const credit = node.attrs?.credit
    ? `<caption><para>Credit: ${esc(String(node.attrs.credit))}</para></caption>`
    : '';

  return `<figure role="image" condition="${layout}">${caption}<mediaobject><imageobject><imagedata fileref="${src}"/></imageobject>${
    alt ? `<textobject><phrase>${alt}</phrase></textobject>` : ''
  }</mediaobject>${credit}</figure>`;
}

function serializeFlourishBlock(node: ProseMirrorNode) {
  const dataSrc = esc(String(node.attrs?.dataSrc ?? ''));
  const alt = esc(String(node.attrs?.alt ?? ''));
  const embedType = esc(String(node.attrs?.embedType ?? 'chart'));
  const width = esc(String(node.attrs?.width ?? 'wide'));
  const caption = node.attrs?.caption ? `<title>${esc(String(node.attrs.caption))}</title>` : '';

  return `<figure role="flourish" condition="${width}">${caption}<mediaobject><textobject><phrase>${
    alt || 'Embedded Flourish visualisation'
  }</phrase></textobject></mediaobject><remark><para>Flourish ${embedType}: <ulink url="${dataSrc}">${dataSrc}</ulink></para></remark></figure>`;
}

function serializeMediaTextBlock(node: ProseMirrorNode) {
  const src = esc(String(node.attrs?.src ?? ''));
  const alt = esc(String(node.attrs?.alt ?? ''));
  const mediaType = esc(String(node.attrs?.mediaType ?? 'image'));
  const poster = esc(String(node.attrs?.poster ?? ''));
  const captions = esc(String(node.attrs?.captions ?? ''));
  const caption = String(node.attrs?.caption ?? '').trim();
  const credit = String(node.attrs?.credit ?? '').trim();
  const heading = String(node.attrs?.heading ?? '').trim();
  const eyebrow = String(node.attrs?.eyebrow ?? '').trim();
  const mediaSide = esc(String(node.attrs?.mediaSide ?? 'right'));
  const paragraphs = Array.isArray(node.attrs?.paragraphs)
    ? (node.attrs?.paragraphs as unknown[])
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
    : [];

  const textBody = [
    eyebrow ? `<para role="eyebrow">${esc(eyebrow)}</para>` : '',
    heading ? `<title>${esc(heading)}</title>` : '',
    ...paragraphs.map((paragraph) => `<para>${esc(paragraph)}</para>`),
  ].join('');
  const captionXml = caption ? `<caption><para>${esc(caption)}</para></caption>` : '';
  const creditXml = credit ? `<para role="credit">${esc(credit)}</para>` : '';
  const mediaObject =
    mediaType === 'video'
      ? `<videoobject><videodata fileref="${src}"${
          poster ? ` poster="${poster}"` : ''
        }/></videoobject>${captions ? `<textobject><phrase>Captions: ${captions}</phrase></textobject>` : ''}`
      : `<imageobject><imagedata fileref="${src}"/></imageobject>${
          alt ? `<textobject><phrase>${alt}</phrase></textobject>` : ''
        }`;

  return `<informalfigure role="media-text" condition="${mediaSide}"><mediaobject>${mediaObject}</mediaobject>${captionXml}<sidebar>${textBody}${creditXml}</sidebar></informalfigure>`;
}

function serializeSceneScrollyBlock(node: ProseMirrorNode) {
  const title = String(node.attrs?.title ?? '').trim();
  const intro = String(node.attrs?.intro ?? '').trim();
  const steps = Array.isArray(node.attrs?.steps) ? (node.attrs?.steps as unknown[]) : [];

  const renderedSteps = steps
    .map((step, index) => {
      const item = (step ?? {}) as Record<string, unknown>;
      const stepTitle = String(item.title ?? '').trim();
      const stepBody = String(item.body ?? '').trim();
      const mediaType = String(item.mediaType ?? '').trim() === 'video' ? 'video' : 'image';
      const imageSrc = String(item.imageSrc ?? '').trim();
      const imageAlt = String(item.imageAlt ?? '').trim();
      const videoSrc = String(item.videoSrc ?? '').trim();
      const poster = String(item.poster ?? '').trim();
      const captions = String(item.captions ?? '').trim();
      const caption = String(item.caption ?? '').trim();
      const credit = String(item.credit ?? '').trim();
      const eyebrow = String(item.eyebrow ?? '').trim();
      const placeLabel = String(item.placeLabel ?? '').trim();
      const overlayPosition = String(item.overlayPosition ?? '').trim();
      const focusX = String(item.focusX ?? '').trim();
      const focusY = String(item.focusY ?? '').trim();
      const focusScale = String(item.focusScale ?? '').trim();

      if (!stepTitle || !stepBody) return '';

      const mediaObject =
        mediaType === 'video' && videoSrc
          ? `<videoobject><videodata fileref="${esc(videoSrc)}"${
              poster ? ` poster="${esc(poster)}"` : ''
            }/></videoobject>${captions ? `<textobject><phrase>Captions: ${esc(captions)}</phrase></textobject>` : ''}`
          : imageSrc
            ? `<imageobject><imagedata fileref="${esc(imageSrc)}"/></imageobject>${
                imageAlt ? `<textobject><phrase>${esc(imageAlt)}</phrase></textobject>` : ''
              }`
            : '';

      const meta = [
        eyebrow ? `<para role="eyebrow">${esc(eyebrow)}</para>` : '',
        placeLabel ? `<para role="place-label">${esc(placeLabel)}</para>` : '',
        overlayPosition ? `<para role="overlay-position">${esc(overlayPosition)}</para>` : '',
        focusX && focusY
          ? `<para role="focus">x=${esc(focusX)}, y=${esc(focusY)}${
              focusScale ? `, scale=${esc(focusScale)}` : ''
            }</para>`
          : '',
        credit ? `<para role="credit">${esc(credit)}</para>` : '',
      ]
        .filter(Boolean)
        .join('');

      return `<section xml:id="${esc(`scene-step-${index + 1}`)}"><title>${esc(stepTitle)}</title>${
        mediaObject ? `<informalfigure role="scene-media">${caption ? `<caption><para>${esc(caption)}</para></caption>` : ''}<mediaobject>${mediaObject}</mediaobject></informalfigure>` : ''
      }<para>${esc(stepBody)}</para>${meta}</section>`;
    })
    .filter(Boolean)
    .join('');

  return `<section role="scene-scrolly">${title ? `<title>${esc(title)}</title>` : ''}${
    intro ? `<para>${esc(intro)}</para>` : ''
  }${renderedSteps}</section>`;
}

function serializeStandaloneNode(node: ProseMirrorNode): string {
  switch (node.type) {
    case 'paragraph':
      return serializeParagraph(node);
    case 'blockquote':
      return `<blockquote>${(node.content ?? [])
        .map((child) => {
          if (child.type === 'paragraph') return serializeParagraph(child);
          return serializeStandaloneNode(child);
        })
        .join('')}</blockquote>`;
    case 'bulletList':
    case 'orderedList':
      return serializeList(node);
    case 'codeBlock':
      return `<programlisting>${esc(node.text ?? '')}</programlisting>`;
    case 'imageBlock':
      return serializeImageBlock(node);
    case 'mediaTextBlock':
      return serializeMediaTextBlock(node);
    case 'sceneScrollyBlock':
      return serializeSceneScrollyBlock(node);
    case 'flourishBlock':
      return serializeFlourishBlock(node);
    case 'tableBlock':
      return serializeTableHtml(String(node.attrs?.html ?? ''));
    default:
      return '';
  }
}

type SectionNode = {
  level: number;
  title: string | null;
  titlePlain: string | null;
  blocks: string[];
  children: SectionNode[];
};

function pmToSections(document: ProseMirrorDocument): SectionNode {
  const root: SectionNode = { level: 0, title: null, titlePlain: null, blocks: [], children: [] };
  const stack = [root];
  let skippingContents = false;

  for (const node of document.content ?? []) {
    if (node.type === 'heading') {
      skippingContents = false;
      const level = Math.max(1, Math.min(6, Number(node.attrs?.level ?? 1)));
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const section: SectionNode = {
        level,
        title: inlineText(node) || 'Untitled',
        titlePlain: normalizeWhitespace(plainText(node)) || 'Untitled',
        blocks: [],
        children: [],
      };
      stack[stack.length - 1].children.push(section);
      stack.push(section);
      continue;
    }

    if (node.type === 'paragraph') {
      if (!paragraphHasSubstance(node)) continue;

      if (paragraphLooksLikeContentsHeading(node)) {
        skippingContents = true;
        continue;
      }

      if (skippingContents && paragraphLooksLikeTocEntry(node)) {
        continue;
      }

      skippingContents = false;
    }

    const serialized = serializeStandaloneNode(node);
    if (serialized) {
      stack[stack.length - 1].blocks.push(serialized);
    }
  }

  return root;
}

function renderSections(root: SectionNode, fallbackTitle: string) {
  const uniqueId = makeUniqueIdFactory();

  function renderSection(section: SectionNode): string {
    const id = uniqueId(slugifyTitle(section.titlePlain ?? section.title ?? 'section'));
    const title = section.title ? `<title>${section.title}</title>` : '';
    const body: string = [...section.blocks, ...section.children.map(renderSection)].join('');
    return `<section xml:id="${id}">${title}${body}</section>`;
  }

  if (!root.children.length) {
    const id = uniqueId(slugifyTitle(fallbackTitle));
    return `<section xml:id="${id}"><title>${esc(fallbackTitle)}</title>${root.blocks.join('')}</section>`;
  }

  if (root.blocks.length) {
    const id = uniqueId(slugifyTitle(fallbackTitle));
    const leadSection = `<section xml:id="${id}"><title>${esc(fallbackTitle)}</title>${root.blocks.join('')}</section>`;
    return [leadSection, ...root.children.map(renderSection)].join('');
  }

  return root.children.map(renderSection).join('');
}

function contributorXml(contributor: StorContributor, tag: 'author' | 'othercredit') {
  const role = contributor.role ? `<role>${esc(contributor.role)}</role>` : '';
  const affiliation = contributor.affiliation
    ? `<affiliation>${esc(contributor.affiliation)}</affiliation>`
    : '';
  const jobTitle = contributor.profileRole ? `<jobtitle>${esc(contributor.profileRole)}</jobtitle>` : '';
  const bio = contributor.bio ? `<personblurb><para>${esc(contributor.bio)}</para></personblurb>` : '';

  return `<${tag}><personname>${esc(contributor.name)}</personname>${role}${jobTitle}${affiliation}${bio}</${tag}>`;
}

function contributorsXml(contributors: StorContributor[] | undefined) {
  if (!contributors?.length) return '';

  const authors = contributors.filter((contributor) => contributor.role.toLowerCase() === 'author');
  const others = contributors.filter((contributor) => contributor.role.toLowerCase() !== 'author');

  return [
    ...authors.map((contributor) => contributorXml(contributor, 'author')),
    ...others.map((contributor) => contributorXml(contributor, 'othercredit')),
  ].join('');
}

function keywordsetXml(values: string[] | undefined) {
  if (!values?.length) return '';
  return `<keywordset>${values.map((value) => `<keyword>${esc(value)}</keyword>`).join('')}</keywordset>`;
}

function uniqueKeywordValues(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function oorMetaXml(document: StorDocument) {
  const parts = [
    `<oor:destination>${esc(document.destination)}</oor:destination>`,
    `<oor:contentType>${esc(document.type)}</oor:contentType>`,
    document.committeeName ? `<oor:committeeName>${esc(document.committeeName)}</oor:committeeName>` : '',
    typeof document.featured === 'boolean'
      ? `<oor:featured>${document.featured ? 'true' : 'false'}</oor:featured>`
      : '',
    document.heroLayout ? `<oor:heroLayout>${esc(document.heroLayout)}</oor:heroLayout>` : '',
    typeof document.showContents === 'boolean'
      ? `<oor:showContents>${document.showContents ? 'true' : 'false'}</oor:showContents>`
      : '',
    document.flourishWidth ? `<oor:flourishWidth>${esc(document.flourishWidth)}</oor:flourishWidth>` : '',
  ].filter(Boolean);

  if (document.hero) {
    parts.push(
      `<oor:hero src="${esc(document.hero.src)}" alt="${esc(document.hero.alt)}">${
        document.hero.position ? `<oor:position>${esc(document.hero.position)}</oor:position>` : ''
      }</oor:hero>`,
    );
  }

  if (document.launchVideo) {
    parts.push(
      `<oor:launchVideo src="${esc(document.launchVideo.src)}">${
        document.launchVideo.poster ? `<oor:poster>${esc(document.launchVideo.poster)}</oor:poster>` : ''
      }${
        document.launchVideo.caption ? `<oor:caption>${esc(document.launchVideo.caption)}</oor:caption>` : ''
      }${
        document.launchVideo.credit ? `<oor:credit>${esc(document.launchVideo.credit)}</oor:credit>` : ''
      }</oor:launchVideo>`,
    );
  }

  return parts.length ? `<oor:meta>${parts.join('')}</oor:meta>` : '';
}

export function storDocumentToXml(document: StorDocument) {
  const sectionTree = pmToSections(document.content);
  const body = renderSections(sectionTree, document.title);
  const title = esc(document.title);
  const subtitle = document.dek ? `<subtitle>${esc(document.dek)}</subtitle>` : '';
  const abstract = document.abstract ? `<abstract><para>${esc(document.abstract)}</para></abstract>` : '';
  const date = document.publishedDate ? `<date>${esc(document.publishedDate)}</date>` : '';
  const publisher = document.publisher
    ? `<publisher><publishername>${esc(document.publisher)}</publishername></publisher>`
    : '';
  const revhistory = document.version
    ? `<revhistory><revision><revnumber>${esc(document.version)}</revnumber>${date}${
        document.status ? `<revremark>${esc(document.status)}</revremark>` : ''
      }</revision></revhistory>`
    : '';
  const legalnotice = document.license
    ? `<legalnotice><para>${esc(document.license)}</para></legalnotice>`
    : '';
  const pubidentifier = document.doi
    ? `<pubidentifier type="doi">${esc(document.doi)}</pubidentifier>`
    : '';
  const keywords = keywordsetXml(
    uniqueKeywordValues([
      ...(document.keywords ?? []),
      ...(document.topics ?? []),
      ...(document.eyebrow ? [document.eyebrow] : []),
    ]),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<article xmlns="http://docbook.org/ns/docbook"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:oor="https://oireachtas.ie/ns/docbook-oireachtas"
         version="5.0"
         xml:lang="${esc(document.language ?? 'en')}"
         xsi:schemaLocation="http://docbook.org/ns/docbook http://docbook.org/xml/5.0/rng/docbook.rng">
  <info>
    <title>${title}</title>
    ${subtitle}
    ${contributorsXml(document.contributors)}
    ${pubidentifier}
    ${date}
    ${revhistory}
    ${publisher}
    ${legalnotice}
    ${abstract}
    ${keywords}
    ${oorMetaXml(document)}
  </info>
  ${body}
</article>`;
}
