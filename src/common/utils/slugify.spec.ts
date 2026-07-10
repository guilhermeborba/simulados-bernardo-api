import { slugify } from './slugify';

describe('slugify', () => {
  it('normalizes text into URL-safe slugs', () => {
    expect(slugify('Matemática — 3º Ano AV1')).toBe('matematica-3-ano-av1');
  });
});
