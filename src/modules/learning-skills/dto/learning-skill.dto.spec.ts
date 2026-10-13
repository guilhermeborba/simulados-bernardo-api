import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  CreateLearningSkillDto,
  PublishLearningSkillDto,
  StartReviewDto,
} from './learning-skill.dto';
const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const body = {
  code: 'math.count',
  title: 'Contagem',
  description: 'Reconhecer a quantidade de objetos.',
  disciplineId: 'math',
  schoolYear: 3,
};
describe('Learning skill and review DTOs', () => {
  it.each([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    'accepts explicit audience %s',
    async (schoolYear) => {
      await expect(
        pipe.transform(
          { ...body, schoolYear },
          { type: 'body', metatype: CreateLearningSkillDto },
        ),
      ).resolves.toMatchObject({ schoolYear });
    },
  );
  it.each([null, false, '1', 0, -1])(
    'rejects malformed content version %p',
    async (version) => {
      await expect(
        pipe.transform(
          { ...body, version },
          { type: 'body', metatype: CreateLearningSkillDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );
  it('requires an explicit editorial review confirmation without accepting another reviewer identity', async () => {
    await expect(
      pipe.transform(
        { reviewConfirmed: true },
        { type: 'body', metatype: PublishLearningSkillDto },
      ),
    ).resolves.toMatchObject({ reviewConfirmed: true });
    for (const payload of [
      {},
      { reviewConfirmed: false },
      { reviewConfirmed: 'true' },
      { reviewConfirmed: true, reviewedBy: 'caller' },
    ])
      await expect(
        pipe.transform(payload, {
          type: 'body',
          metatype: PublishLearningSkillDto,
        }),
      ).rejects.toThrow(BadRequestException);
  });
  it('keeps the selected review question IDs and mode under server control', async () => {
    await expect(
      pipe.transform(
        { quizId: 'quiz' },
        { type: 'body', metatype: StartReviewDto },
      ),
    ).resolves.toMatchObject({ quizId: 'quiz' });
    for (const payload of [
      { quizId: null },
      { quizId: ' ' },
      { quizId: 'quiz', questionIds: ['q1'] },
      { quizId: 'quiz', practiceMode: 'NORMAL' },
    ])
      await expect(
        pipe.transform(payload, { type: 'body', metatype: StartReviewDto }),
      ).rejects.toThrow(BadRequestException);
  });
});
