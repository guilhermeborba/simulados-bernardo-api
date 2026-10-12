import { PrismaClient } from '@prisma/client';
import {
  normalizeCatalogQuiz,
  readQuizCatalog,
  quizCatalogInventory,
  validateQuizCatalog,
} from './quiz-catalog';
import { importQuizCatalog } from './quiz-catalog-import';

function fixture() {
  return {
    activityKey: 'catalog-quantities',
    contentVersion: 1,
    disciplineSlug: 'matematica',
    schoolYear: 3,
    topic: 'Contagem',
    title: 'Conte os objetos',
    estimatedDurationMinutes: 5,
    review: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
    questions: [
      {
        originKey: 'quantity.one',
        statement: 'Quanto é um mais um?',
        explanation: 'Uma unidade mais uma unidade resulta em duas.',
        points: 1,
        options: [
          { optionKey: 'A', text: 'Um' },
          { optionKey: 'B', text: 'Dois' },
        ],
        correctAnswer: 'B',
      },
    ],
  };
}
function approvedFixture() {
  const input = fixture();
  return {
    ...input,
    review: {
      status: 'APPROVED',
      reviewedBy: 'Synthetic reviewer',
      reviewedAt: '2026-10-01T12:00:00.000Z',
      contentHash: normalizeCatalogQuiz(input).contentHash,
    },
  };
}

describe('Quiz catalog validation and editorial review', () => {
  it('normalizes content deterministically with no database access', () => {
    const first = normalizeCatalogQuiz(fixture());
    const second = normalizeCatalogQuiz(JSON.parse(JSON.stringify(fixture())));
    expect(first).toEqual(second);
    expect(first.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.questions[0].media).toBeNull();
  });
  it('accepts reviewed content only when its canonical hash matches', () => {
    expect(normalizeCatalogQuiz(approvedFixture()).review.status).toBe(
      'APPROVED',
    );
  });
  it.each([
    ['empty catalog', () => validateQuizCatalog([])],
    [
      'unknown quiz field',
      () => normalizeCatalogQuiz({ ...fixture(), correctAnswer: 'B' }),
    ],
    [
      'whitespace title',
      () => normalizeCatalogQuiz({ ...fixture(), title: ' Conta ' }),
    ],
    [
      'whitespace activity key',
      () => normalizeCatalogQuiz({ ...fixture(), activityKey: ' catalog ' }),
    ],
    [
      'noninteger version',
      () => normalizeCatalogQuiz({ ...fixture(), contentVersion: 1.5 }),
    ],
    [
      'string version',
      () => normalizeCatalogQuiz({ ...fixture(), contentVersion: '1' }),
    ],
    [
      'overflow version',
      () => normalizeCatalogQuiz({ ...fixture(), contentVersion: 2147483648 }),
    ],
    [
      'zero version',
      () => normalizeCatalogQuiz({ ...fixture(), contentVersion: 0 }),
    ],
    [
      'unknown discipline',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          disciplineSlug: 'new-discipline',
        }),
    ],
    [
      'technical audience mismatch',
      () => normalizeCatalogQuiz({ ...fixture(), schoolYear: 0 }),
    ],
    [
      'infantil audience mismatch',
      () => normalizeCatalogQuiz({ ...fixture(), schoolYear: -1 }),
    ],
    [
      'audience outside range',
      () => normalizeCatalogQuiz({ ...fixture(), schoolYear: 13 }),
    ],
    [
      'question empty array',
      () => normalizeCatalogQuiz({ ...fixture(), questions: [] }),
    ],
    [
      'missing explanation',
      () => {
        const input = fixture();
        input.questions[0].explanation = '';
        normalizeCatalogQuiz(input);
      },
    ],
    [
      'invalid origin',
      () => {
        const input = fixture();
        input.questions[0].originKey = 'quantity/one';
        normalizeCatalogQuiz(input);
      },
    ],
    [
      'string points',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [{ ...fixture().questions[0], points: '1' }],
        }),
    ],
    [
      'zero points',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [{ ...fixture().questions[0], points: 0 }],
        }),
    ],
    [
      'three decimals',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [{ ...fixture().questions[0], points: 1.001 }],
        }),
    ],
    [
      'score overflow',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [
            { ...fixture().questions[0], points: 6000 },
            { ...fixture().questions[0], originKey: 'second', points: 6000 },
          ],
        }),
    ],
    [
      'duplicate origins',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [fixture().questions[0], fixture().questions[0]],
        }),
    ],
    [
      'ambiguous option keys',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [
            {
              ...fixture().questions[0],
              options: [
                { optionKey: 'A', text: 'Um' },
                { optionKey: 'a', text: 'Dois' },
              ],
              correctAnswer: 'A',
            },
          ],
        }),
    ],
    [
      'answer not in options',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [{ ...fixture().questions[0], correctAnswer: 'C' }],
        }),
    ],
    [
      'extra question field',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [{ ...fixture().questions[0], officialAnswers: [] }],
        }),
    ],
    [
      'extra option field',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [
            {
              ...fixture().questions[0],
              options: [
                { optionKey: 'A', text: 'Um', metadata: {} },
                { optionKey: 'B', text: 'Dois' },
              ],
            },
          ],
        }),
    ],
    [
      'unregistered media',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [
            {
              ...fixture().questions[0],
              media: { image: { assetId: 'unknown', alt: 'Imagem' } },
            },
          ],
        }),
    ],
    [
      'external media URL',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          questions: [
            {
              ...fixture().questions[0],
              media: {
                image: { url: 'https://example.test/a.png', alt: 'Imagem' },
              },
            },
          ],
        }),
    ],
    [
      'missing Infantil media',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          schoolYear: -1,
          disciplineSlug: 'infantil-espacos-tempos-quantidades',
        }),
    ],
    [
      'invalid source URL',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          sources: [{ title: 'Synthetic source', url: 'javascript:bad' }],
        }),
    ],
    [
      'credentialed source URL',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          sources: [
            {
              title: 'Synthetic source',
              url: 'https://user:password@example.test',
            },
          ],
        }),
    ],
    [
      'fake pending reviewer',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          review: { status: 'PENDING', reviewedBy: 'Fake', reviewedAt: null },
        }),
    ],
    [
      'missing approval hash',
      () =>
        normalizeCatalogQuiz({
          ...fixture(),
          review: {
            status: 'APPROVED',
            reviewedBy: 'Reviewer',
            reviewedAt: '2026-10-01T12:00:00.000Z',
          },
        }),
    ],
    [
      'impossible date',
      () =>
        normalizeCatalogQuiz({
          ...approvedFixture(),
          review: {
            ...approvedFixture().review,
            reviewedAt: '2026-02-30T12:00:00.000Z',
          },
        }),
    ],
    [
      'changed approved content',
      () =>
        normalizeCatalogQuiz({
          ...approvedFixture(),
          title: 'Conte novamente os objetos',
        }),
    ],
    [
      'duplicate logical version',
      () => validateQuizCatalog([fixture(), fixture()]),
    ],
    [
      'slug collision',
      () =>
        validateQuizCatalog([
          fixture(),
          { ...fixture(), activityKey: 'catalog.quantities' },
        ]),
    ],
    [
      'incomplete initial coverage',
      () => validateQuizCatalog([fixture()], true),
    ],
  ])('rejects %s', (_name, operation) => expect(operation).toThrow());
  it('rejects altered options, source bibliography and version after approval', () => {
    const original = approvedFixture();
    expect(() =>
      normalizeCatalogQuiz({
        ...original,
        sources: [{ title: 'New source', url: 'https://example.test' }],
      }),
    ).toThrow('aprovação desatualizada');
    expect(() =>
      normalizeCatalogQuiz({ ...original, contentVersion: 2 }),
    ).toThrow('aprovação desatualizada');
    expect(() =>
      normalizeCatalogQuiz({
        ...original,
        questions: [{ ...original.questions[0], correctAnswer: 'A' }],
      }),
    ).toThrow('aprovação desatualizada');
  });
  it('creates a metadata-only inventory without pedagogical or official content', () => {
    const inventory = quizCatalogInventory(validateQuizCatalog([fixture()]));
    const report = JSON.stringify(inventory);
    for (const field of [
      'statement',
      'explanation',
      'transcript',
      'correctAnswer',
      'options',
      'reviewedBy',
    ])
      expect(report).not.toContain(field);
    expect(inventory.pending).toBe(1);
    expect(inventory.questions).toBe(1);
  });
  it('checks publication review before calling the transaction', async () => {
    const transaction = jest.fn();
    const client = { $transaction: transaction } as unknown as PrismaClient;
    await expect(
      importQuizCatalog(client, validateQuizCatalog([fixture()]), {
        authorEmail: 'admin@example.test',
        publishReviewed: true,
      }),
    ).rejects.toThrow('Publicação bloqueada');
    expect(transaction).not.toHaveBeenCalled();
  });
  it('refuses an absent author without connecting to the database', async () => {
    const transaction = jest.fn();
    const client = { $transaction: transaction } as unknown as PrismaClient;
    await expect(
      importQuizCatalog(client, validateQuizCatalog([fixture()]), {
        authorEmail: '',
      }),
    ).rejects.toThrow('QUIZ_SEED_AUTHOR_EMAIL');
    expect(transaction).not.toHaveBeenCalled();
  });
  it('detects mutation of a normalized catalog before any transaction', async () => {
    const catalog = validateQuizCatalog([fixture()]);
    catalog[0].questions[0].explanation = 'Changed normalized content';
    const transaction = jest.fn();
    const client = { $transaction: transaction } as unknown as PrismaClient;
    await expect(
      importQuizCatalog(client, catalog, { authorEmail: 'admin@example.test' }),
    ).rejects.toThrow('alterado');
    expect(transaction).not.toHaveBeenCalled();
  });
  it('validates the complete initial catalog and all audience coverage', () => {
    const catalog = readQuizCatalog();
    const inventory = quizCatalogInventory(catalog);
    expect(inventory).toMatchObject({
      quizzes: 45,
      questions: 213,
      pending: 45,
      approved: 0,
    });
    expect(inventory.coverage.every((entry) => entry.quizzes === 3)).toBe(true);
    expect(
      inventory.entries.reduce((sum, entry) => sum + entry.images, 0),
    ).toBe(18);
    expect(
      inventory.entries.reduce((sum, entry) => sum + entry.audios, 0),
    ).toBe(18);
  });
});
