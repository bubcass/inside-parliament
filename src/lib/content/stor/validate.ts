import type { StorDocument } from './types';

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid Stór document: "${field}" is required.`);
  }
}

export function validateStorDocument(value: StorDocument) {
  requiredString(value.id, 'id');
  requiredString(value.slug, 'slug');
  requiredString(value.title, 'title');
  requiredString(value.type, 'type');
  requiredString(value.destination, 'destination');

  if (!value.content || value.content.type !== 'doc') {
    throw new Error('Invalid Stór document: "content" must be a ProseMirror doc.');
  }

  if (!Array.isArray(value.content.content)) {
    throw new Error(
      'Invalid Stór document: "content.content" must be an array.',
    );
  }

  if (value.enhancements && !Array.isArray(value.enhancements)) {
    throw new Error(
      'Invalid Stór document: "enhancements" must be an array when provided.',
    );
  }

  if (
    value.destination === 'committee-reports' &&
    (!value.committeeName || !value.committeeName.trim())
  ) {
    throw new Error(
      'Invalid Stór document: committee reports require "committeeName".',
    );
  }

  if (value.language && value.language.trim().length < 2) {
    throw new Error('Invalid Stór document: "language" must be a language code.');
  }

  if (value.keywords && !Array.isArray(value.keywords)) {
    throw new Error('Invalid Stór document: "keywords" must be an array when provided.');
  }

  return value;
}
