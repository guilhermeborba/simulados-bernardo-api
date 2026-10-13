import {
  readSkillCatalog,
  validateSkillCatalog,
  skillCatalogInventory,
  skillProposalHash,
} from './learning-skill-catalog';
const catalog = () => structuredClone(readSkillCatalog());
describe('Proposed initial skills and classifications', () => {
  it('covers all 213 questions and 15 audiences with 45 pending internal skills', () => {
    const data = skillCatalogInventory();
    expect(data).toMatchObject({
      skills: 45,
      classifiedQuestions: 213,
      pending: 45,
      approved: 0,
    });
    expect(data.coverage).toHaveLength(15);
    expect(
      data.proposals.every(
        (s) => s.review.reviewedBy === null && s.review.reviewedAt === null,
      ),
    ).toBe(true);
    expect(JSON.stringify(data)).not.toMatch(
      /"correctAnswer"|"statement"|"officialAnswers"|BNCC/,
    );
  });
  it.each([
    'schoolYear',
    'disciplineSlug',
    'origin',
    'hash',
    'duplicate',
    'missing',
    'extra',
  ])('rejects incorrect %s classifications', (field) => {
    const data = catalog();
    if (field === 'schoolYear') data[0].schoolYear = 12;
    if (field === 'disciplineSlug') data[0].disciplineSlug = 'missing';
    if (field === 'origin') data[0].quiz.questionOriginKeys[0] = 'missing';
    if (field === 'hash') data[0].quiz.contentHash = 'incorrect';
    if (field === 'duplicate')
      data[0].quiz.questionOriginKeys.push(data[0].quiz.questionOriginKeys[0]);
    if (field === 'missing') data[0].quiz.questionOriginKeys.pop();
    if (field === 'extra')
      Object.assign(data[0], { curriculumCode: 'unverified' });
    expect(() => validateSkillCatalog(data)).toThrow();
  });
  it('binds a real editorial approval to the exact proposed definition and mapping', () => {
    const data = catalog();
    data[0].review = {
      status: 'APPROVED',
      reviewedBy: 'Synthetic reviewer',
      reviewedAt: '2026-10-13T12:00:00Z',
      contentHash: skillProposalHash(data[0]),
    };
    expect(validateSkillCatalog(data)[0].review.status).toBe('APPROVED');
    data[0].title += ' changed';
    expect(() => validateSkillCatalog(data)).toThrow();
  });
  it('does not presume approval from a reviewer assignment or an unbound status', () => {
    const data = catalog();
    data[0].review.reviewedBy = 'Assigned only';
    expect(() => validateSkillCatalog(data)).toThrow();
    data[0].review.status = 'APPROVED';
    data[0].review.reviewedAt = '2026-10-13T12:00:00Z';
    expect(() => validateSkillCatalog(data)).toThrow();
  });
});
