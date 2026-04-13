import { describe, it, expect } from 'vitest';
import {
  UploadSchema,
  MediaKindSchema,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
} from './upload';

function makeFile(size: number, type: string): File {
  return new File([new Uint8Array(size)], 'test', { type });
}

describe('UploadSchema', () => {
  it('accepts a small PNG', () => {
    expect(UploadSchema.safeParse({ file: makeFile(1024, 'image/png') }).success).toBe(true);
  });

  it('accepts all whitelisted MIME types', () => {
    for (const mime of ACCEPTED_MIME_TYPES) {
      expect(UploadSchema.safeParse({ file: makeFile(1024, mime) }).success).toBe(true);
    }
  });

  it('rejects files above MAX_FILE_SIZE', () => {
    expect(
      UploadSchema.safeParse({ file: makeFile(MAX_FILE_SIZE + 1, 'image/png') }).success,
    ).toBe(false);
  });

  it('rejects non-image MIME types', () => {
    expect(
      UploadSchema.safeParse({ file: makeFile(1024, 'application/pdf') }).success,
    ).toBe(false);
    expect(
      UploadSchema.safeParse({ file: makeFile(1024, 'image/gif') }).success,
    ).toBe(false);
  });

  it('rejects input that is not a File', () => {
    expect(UploadSchema.safeParse({ file: { name: 'x' } }).success).toBe(false);
  });
});

describe('MediaKindSchema', () => {
  it('accepts the four declared kinds', () => {
    for (const k of ['LOGO', 'COVER', 'DISH', 'GENERIC']) {
      expect(MediaKindSchema.safeParse(k).success).toBe(true);
    }
  });

  it('rejects unknown kinds', () => {
    expect(MediaKindSchema.safeParse('AVATAR').success).toBe(false);
  });
});
