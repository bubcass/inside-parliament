import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { StorDestination } from '$lib/content/stor/types';
import {
  classifyPublisherAssetKind,
  isPublisherAssetFilenameAllowed,
  sanitizePublisherAssetFilename,
  sharedAssetFolderRelative,
  storyAssetFolderRelative,
  type PublisherAssetEntry,
  type PublisherAssetScope,
} from '$lib/publisher/assets';

const DESTINATIONS = new Set<StorDestination>([
  'parliament-now',
  'parliament-explained',
  'parliament-at-work',
  'committee-reports',
  'houses-of-the-oireachtas',
  'library-research-service',
  'parliamentary-budget-office',
]);

function isValidDestination(value: string): value is StorDestination {
  return DESTINATIONS.has(value as StorDestination);
}

function isValidSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

function relativeFolderForScope(options: {
  destination: StorDestination;
  slug: string;
  scope: PublisherAssetScope;
}) {
  return options.scope === 'shared'
    ? sharedAssetFolderRelative()
    : storyAssetFolderRelative({
        destination: options.destination,
        slug: options.slug,
      });
}

async function walkAssetFolder(options: {
  rootRelative: string;
  scope: PublisherAssetScope;
}) {
  const rootAbsolute = resolve(process.cwd(), 'static', options.rootRelative);
  const entries: PublisherAssetEntry[] = [];

  async function visit(currentAbsolute: string, currentRelative: string): Promise<void> {
    let children;
    try {
      children = await readdir(currentAbsolute, { withFileTypes: true });
    } catch {
      return;
    }

    for (const child of children) {
      if (child.name.startsWith('.')) continue;

      const childAbsolute = resolve(currentAbsolute, child.name);
      const childRelative = `${currentRelative}/${child.name}`;

      if (child.isDirectory()) {
        await visit(childAbsolute, childRelative);
        continue;
      }

      const details = await stat(childAbsolute);
      entries.push({
        path: `/${childRelative.replace(/\\/g, '/')}`,
        name: child.name,
        scope: options.scope,
        kind: classifyPublisherAssetKind(child.name),
        modifiedAt: details.mtime.toISOString(),
      });
    }
  }

  await visit(rootAbsolute, options.rootRelative);

  return entries;
}

async function uniqueAbsolutePath(baseAbsolute: string, filename: string) {
  const extensionMatch = filename.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1] ?? '';
  const basename = extension ? filename.slice(0, -extension.length) : filename;
  let attempt = 0;

  while (true) {
    const candidateName = attempt === 0 ? filename : `${basename}-${attempt + 1}${extension}`;
    const candidateAbsolute = resolve(baseAbsolute, candidateName);

    try {
      await stat(candidateAbsolute);
      attempt += 1;
    } catch {
      return {
        absolutePath: candidateAbsolute,
        filename: candidateName,
      };
    }
  }
}

export const GET: RequestHandler = async ({ url }) => {
  const destination = url.searchParams.get('destination')?.trim() ?? '';
  const slug = url.searchParams.get('slug')?.trim() ?? '';

  if (!isValidDestination(destination) || !isValidSlug(slug)) {
    return json({ ok: false, message: 'A valid destination and slug are required.' }, { status: 400 });
  }

  const [storyAssets, sharedAssets] = await Promise.all([
    walkAssetFolder({
      rootRelative: storyAssetFolderRelative({ destination, slug }),
      scope: 'story',
    }),
    walkAssetFolder({
      rootRelative: sharedAssetFolderRelative(),
      scope: 'shared',
    }),
  ]);

  const assets = [...storyAssets, ...sharedAssets].sort((a, b) => {
    if (a.scope !== b.scope) return a.scope === 'story' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return json({
    ok: true,
    assets,
    storyFolder: `/${storyAssetFolderRelative({ destination, slug })}`,
    sharedFolder: `/${sharedAssetFolderRelative()}`,
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const destination = String(form.get('destination') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const scopeValue = String(form.get('scope') ?? 'story').trim().toLowerCase();
  const scope: PublisherAssetScope = scopeValue === 'shared' ? 'shared' : 'story';
  const file = form.get('file');

  if (!isValidDestination(destination) || !isValidSlug(slug)) {
    return json({ ok: false, message: 'A valid destination and slug are required.' }, { status: 400 });
  }

  if (!(file instanceof File) || !file.name.trim()) {
    return json({ ok: false, message: 'Choose a file to upload.' }, { status: 400 });
  }

  const sanitizedFilename = sanitizePublisherAssetFilename(file.name);
  if (!isPublisherAssetFilenameAllowed(sanitizedFilename)) {
    return json(
      {
        ok: false,
        message: 'Only common image, video, audio, and captions files can be uploaded here.',
      },
      { status: 400 },
    );
  }

  const relativeFolder = relativeFolderForScope({ destination, slug, scope });
  const absoluteFolder = resolve(process.cwd(), 'static', relativeFolder);
  const resolvedFile = await uniqueAbsolutePath(absoluteFolder, sanitizedFilename);

  await mkdir(absoluteFolder, { recursive: true });
  await writeFile(resolvedFile.absolutePath, Buffer.from(await file.arrayBuffer()));

  const entry: PublisherAssetEntry = {
    path: `/${relativeFolder}/${resolvedFile.filename}`.replace(/\\/g, '/'),
    name: resolvedFile.filename,
    scope,
    kind: classifyPublisherAssetKind(resolvedFile.filename),
    modifiedAt: new Date().toISOString(),
  };

  return json({
    ok: true,
    asset: entry,
    storyFolder: `/${storyAssetFolderRelative({ destination, slug })}`,
    sharedFolder: `/${sharedAssetFolderRelative()}`,
  });
};
