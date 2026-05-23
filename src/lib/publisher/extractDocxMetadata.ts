import JSZip from 'jszip';

function text(node: Node | null) {
  return (node && 'textContent' in node ? node.textContent : '') || '';
}

function toDateISO(value: string) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function splitKeywords(value: string) {
  return String(value || '')
    .split(/[,;]\s*|\s*\n+\s*/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function firstByLocalName(document: Document | null, localName: string) {
  if (!document) return null;
  const matches = document.getElementsByTagNameNS('*', localName);
  return matches.length ? matches[0] : null;
}

function allByLocalName(document: Document | null, localName: string) {
  if (!document) return [];
  return Array.from(document.getElementsByTagNameNS('*', localName));
}

function parseCoreXml(xml: string) {
  if (!xml) return {};

  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const created = firstByLocalName(document, 'created');
  const modified = firstByLocalName(document, 'modified');
  const keywordsRaw = text(firstByLocalName(document, 'keywords'));

  return {
    title: text(firstByLocalName(document, 'title')) || undefined,
    subject: text(firstByLocalName(document, 'subject')) || undefined,
    description: text(firstByLocalName(document, 'description')) || undefined,
    creator: text(firstByLocalName(document, 'creator')) || undefined,
    author: text(firstByLocalName(document, 'creator')) || undefined,
    lastModifiedBy:
      text(firstByLocalName(document, 'lastModifiedBy')) || undefined,
    revision: text(firstByLocalName(document, 'revision')) || undefined,
    category: text(firstByLocalName(document, 'category')) || undefined,
    contentStatus:
      text(firstByLocalName(document, 'contentStatus')) || undefined,
    language: text(firstByLocalName(document, 'language')) || undefined,
    keywords: splitKeywords(keywordsRaw),
    createdRaw: text(created) || undefined,
    modifiedRaw: text(modified) || undefined,
    dateCreated: toDateISO(text(created)),
    dateModified: toDateISO(text(modified)),
  };
}

function parseCustomXml(xml: string) {
  if (!xml) return {};

  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const properties = allByLocalName(document, 'property');
  const values: Record<string, string | string[]> = {};

  for (const property of properties) {
    const name = property.getAttribute('name') || '';
    if (!name) continue;

    let value = '';
    for (const child of Array.from(property.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        value = text(child);
        break;
      }
    }

    values[name] = value;
  }

  if (typeof values.DatePublished === 'string') {
    values.DatePublished = toDateISO(values.DatePublished) ?? values.DatePublished;
  }

  if (typeof values.DateModified === 'string') {
    values.DateModified = toDateISO(values.DateModified) ?? values.DateModified;
  }

  if (typeof values.Language === 'string') {
    values.Language = values.Language.trim();
  }

  if (typeof values.Keywords === 'string') {
    values.Keywords = splitKeywords(values.Keywords);
  }

  return values;
}

export async function extractDocxMetadata(arrayBuffer: ArrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const coreXml = zip.file('docProps/core.xml')
    ? await zip.file('docProps/core.xml')!.async('string')
    : '';
  const customXml = zip.file('docProps/custom.xml')
    ? await zip.file('docProps/custom.xml')!.async('string')
    : '';

  return {
    core: parseCoreXml(coreXml),
    custom: parseCustomXml(customXml),
  };
}
