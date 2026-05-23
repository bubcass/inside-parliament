import type { StorDestination, StorDocument } from '$lib/content/stor/types';

export const DESTINATION_OPTIONS: Array<{
  value: StorDestination;
  label: string;
}> = [
  { value: 'parliament-now', label: 'Parliament Now' },
  { value: 'parliament-explained', label: 'Parliament Explained' },
  { value: 'parliament-at-work', label: 'Parliament at Work' },
];

export const TYPE_OPTIONS: Record<
  StorDestination,
  Array<{ value: StorDocument['type']; label: string }>
> = {
  'parliament-now': [
    { value: 'article', label: 'Article' },
    { value: 'scrollytelling-article', label: 'Scrollytelling article' },
  ],
  'parliament-explained': [
    { value: 'article', label: 'Article' },
    { value: 'scrollytelling-article', label: 'Scrollytelling article' },
  ],
  'parliament-at-work': [
    { value: 'article', label: 'Article' },
    { value: 'scrollytelling-article', label: 'Scrollytelling article' },
  ],
  'committee-reports': [{ value: 'committee-report', label: 'Committee report' }],
  'houses-of-the-oireachtas': [
    { value: 'article', label: 'Article' },
    { value: 'briefing', label: 'Briefing' },
  ],
  'library-research-service': [
    { value: 'article', label: 'Article' },
    { value: 'briefing', label: 'Briefing' },
    { value: 'visual-data-analysis', label: 'Visual data analysis' },
    { value: 'bill-digest', label: 'Bill digest' },
  ],
  'parliamentary-budget-office': [
    { value: 'article', label: 'Article' },
    { value: 'briefing', label: 'Briefing' },
    { value: 'visual-data-analysis', label: 'Visual data analysis' },
    { value: 'research-note', label: 'Research note' },
  ],
};

export const STATUS_OPTIONS: Array<{
  value: NonNullable<StorDocument['status']>;
  label: string;
}> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];
