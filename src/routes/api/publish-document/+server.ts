import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import type {
  ProseMirrorDocument,
  ProseMirrorNode,
  StorDocument,
} from '$lib/content/stor/types';

type PublishPayload = {
  path?: string;
  document?: StorDocument;
};

function extensionForMimeType(mimeType: string) {
  switch (mimeType.toLowerCase()) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '';
  }
}

function parseDataImageUri(value: string) {
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
  if (!match) return null;

  const [, mimeType, base64] = match;
  return {
    mimeType,
    buffer: Buffer.from(base64, 'base64'),
  };
}

async function materializeImageAssets(options: {
  relativePath: string;
  document: StorDocument;
}) {
  const relativeJsonPath = options.relativePath.replace(/^src\/lib\/content\/stor\/documents\//, '');
  const jsonExtension = extname(relativeJsonPath);
  const assetBase = relativeJsonPath.slice(0, relativeJsonPath.length - jsonExtension.length);
  const assetRootRelative = `media/imported/${assetBase}`;
  const assetRootAbsolute = resolve(process.cwd(), 'static', assetRootRelative);
  let imageCounter = 0;

  async function visitNode(node: ProseMirrorNode): Promise<ProseMirrorNode> {
    const nextNode: ProseMirrorNode = {
      ...node,
      attrs: node.attrs ? { ...node.attrs } : node.attrs,
      content: node.content ? [] : node.content,
    };

    if (node.type === 'imageBlock') {
      const src = String(node.attrs?.src ?? '').trim();
      const parsed = parseDataImageUri(src);

      if (parsed) {
        imageCounter += 1;
        const extension = extensionForMimeType(parsed.mimeType) || '.bin';
        const filename = `image-${String(imageCounter).padStart(2, '0')}${extension}`;
        const relativeAssetPath = `/${assetRootRelative}/${filename}`;
        const absoluteAssetPath = resolve(assetRootAbsolute, filename);

        await mkdir(dirname(absoluteAssetPath), { recursive: true });
        await writeFile(absoluteAssetPath, parsed.buffer);

        nextNode.attrs = {
          ...(nextNode.attrs ?? {}),
          src: relativeAssetPath,
        };
      }
    }

    if (node.content?.length) {
      nextNode.content = [];
      for (const child of node.content) {
        nextNode.content.push(await visitNode(child));
      }
    }

    return nextNode;
  }

  const content: ProseMirrorNode[] = [];
  for (const node of options.document.content.content) {
    content.push(await visitNode(node));
  }

  const nextContent: ProseMirrorDocument = {
    ...options.document.content,
    content,
  };

  return {
    ...options.document,
    content: nextContent,
  };
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = (await request.json()) as PublishPayload;
    const relativePath = payload.path?.trim();
    const document = payload.document;

    if (!relativePath || !document) {
      return json({ ok: false }, { status: 400 });
    }

    const targetPath = resolve(process.cwd(), relativePath);
    const contentRoot = resolve(process.cwd(), 'src/lib/content/stor/documents');

    if (!targetPath.startsWith(contentRoot)) {
      return json({ ok: false }, { status: 400 });
    }

    const documentWithAssets = await materializeImageAssets({
      relativePath,
      document,
    });

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(
      targetPath,
      `${JSON.stringify(documentWithAssets, null, 2)}\n`,
      'utf8',
    );

    return json({ ok: true, path: relativePath, document: documentWithAssets });
  } catch {
    return json({ ok: false }, { status: 500 });
  }
};
