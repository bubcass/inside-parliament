import type { StorDestination } from '$lib/content/stor/types';

export function destinationFolder(destination: StorDestination) {
  switch (destination) {
    case 'parliament-now':
      return 'parliament-now';
    case 'parliament-explained':
      return 'parliament-explained';
    case 'parliament-at-work':
      return 'parliament-at-work';
    case 'committee-reports':
      return 'committee-reports';
    case 'houses-of-the-oireachtas':
      return 'houses-of-the-oireachtas';
    case 'library-research-service':
      return 'library-research-service';
    case 'parliamentary-budget-office':
      return 'parliamentary-budget-office';
  }
}

export function suggestedStorDocumentPath(options: {
  destination: StorDestination;
  slug: string;
}) {
  const base = `src/lib/content/stor/documents/${destinationFolder(options.destination)}`;
  return `${base}/${options.slug}.json`;
}
