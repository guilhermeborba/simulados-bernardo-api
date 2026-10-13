import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateQuizDto } from './create-quiz.dto';
import { UpdateQuizDto } from './update-quiz.dto';
import { FindAvailableQuizzesDto } from './find-available-quizzes.dto';

const payload = () => ({
  activityKey: 'quiz-contagem-infantil',
  disciplineId: 'discipline-1',
  schoolYear: -2,
  topic: 'Contagem',
  title: 'Vamos contar',
  questions: [
    {
      originKey: 'contagem-q1',
      statement: 'Quantas bolas?',
      explanation: 'Uma bola e mais uma são duas.',
      points: 1,
      options: [
        { optionKey: 'A', text: 'Uma' },
        { optionKey: 'B', text: 'Duas' },
      ],
      correctAnswer: 'B',
    },
  ],
});

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

function create(body: unknown) {
  return pipe.transform(body, { type: 'body', metatype: CreateQuizDto });
}

describe('Quiz authoring DTOs', () => {
  it.each([-2, -1, 0, 1, 5, 9, 10, 11, 12])(
    'accepts audience schoolYear %s without assessment fields',
    async (schoolYear) => {
      await expect(create({ ...payload(), schoolYear })).resolves.toMatchObject(
        { schoolYear },
      );
    },
  );

  it.each([
    'bimester',
    'assessment',
    'totalQuestions',
    'maxScore',
    'contentVersion',
    'media',
  ])('rejects client-controlled %s', async (field) => {
    await expect(create({ ...payload(), [field]: 1 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects question media before an authorization policy exists', async () => {
    const body = payload();
    await expect(
      create({
        ...body,
        questions: [{ ...body.questions[0], media: { url: 'private' } }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('trims and rejects whitespace-only explanation', async () => {
    const body = payload();
    await expect(
      create({
        ...body,
        questions: [{ ...body.questions[0], explanation: '   ' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects null title updates rather than crashing in the service', async () => {
    await expect(
      pipe.transform(
        { title: null },
        { type: 'body', metatype: UpdateQuizDto },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it.each([false, true, '', '0', '1'])(
    'rejects coerced schoolYear %p in JSON',
    async (schoolYear) => {
      await expect(create({ ...payload(), schoolYear })).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it.each([false, true, '', '1'])(
    'rejects coerced points %p in JSON',
    async (points) => {
      const body = payload();
      await expect(
        create({ ...body, questions: [{ ...body.questions[0], points }] }),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it.each([false, true, '', '1'])(
    'rejects coerced duration %p in JSON',
    async (estimatedDurationMinutes) => {
      await expect(
        create({ ...payload(), estimatedDurationMinutes }),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it.each(['title', 'disciplineId', 'schoolYear', 'topic', 'questions'])(
    'rejects null required field %s in updates',
    async (field) => {
      await expect(
        pipe.transform(
          { [field]: null },
          { type: 'body', metatype: UpdateQuizDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it('accepts null to clear optional draft metadata', async () => {
    const body = {
      subtitle: null,
      turmaId: null,
      estimatedDurationMinutes: null,
    };
    await expect(
      pipe.transform(body, { type: 'body', metatype: UpdateQuizDto }),
    ).resolves.toMatchObject(body);
  });

  it.each(['-2', '-1', '0', '1', '12'])(
    'accepts integer query schoolYear %s',
    async (schoolYear) => {
      await expect(
        pipe.transform(
          { schoolYear },
          { type: 'query', metatype: FindAvailableQuizzesDto },
        ),
      ).resolves.toMatchObject({ schoolYear: Number(schoolYear) });
    },
  );

  it.each(['', ' ', '1.0', false, true])(
    'rejects malformed query schoolYear %p',
    async (schoolYear) => {
      await expect(
        pipe.transform(
          { schoolYear },
          { type: 'query', metatype: FindAvailableQuizzesDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it('keeps logical identity out of update DTO', async () => {
    await expect(
      pipe.transform(
        { activityKey: 'another-key' },
        { type: 'body', metatype: UpdateQuizDto },
      ),
    ).rejects.toThrow(BadRequestException);
  });
  it('accepts a versioned editorial skill reference without accepting client-owned review metadata', async () => {
    const body = payload();
    await expect(
      create({
        ...body,
        questions: [
          { ...body.questions[0], skill: { code: 'counting', version: 1 } },
        ],
      }),
    ).resolves.toMatchObject({
      questions: [{ skill: { code: 'counting', version: 1 } }],
    });
    await expect(
      create({
        ...body,
        questions: [
          {
            ...body.questions[0],
            skill: { code: 'counting', version: 1, reviewedBy: 'client' },
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it.each([
    null,
    {},
    { code: 'counting', version: '1' },
    { code: 'counting', version: 0 },
  ])('rejects malformed skill reference %p', async (skill) => {
    const body = payload();
    await expect(
      create({ ...body, questions: [{ ...body.questions[0], skill }] }),
    ).rejects.toThrow(BadRequestException);
  });
});
