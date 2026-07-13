import { Injectable } from '@nestjs/common';
import { Prisma, QuestionAnswer, QuestionType } from '@prisma/client';

interface CorrectionInput {
  type: QuestionType;
  points: Prisma.Decimal;
  officialAnswers: QuestionAnswer[];
  submittedAnswer: Prisma.JsonValue | null;
}

export interface CorrectionResult {
  isCorrect: boolean;
  pointsEarned: number;
}

@Injectable()
export class AttemptsCorrectionService {
  correct(input: CorrectionInput): CorrectionResult {
    const isCorrect = this.isAnswerCorrect(input);

    return {
      isCorrect,
      pointsEarned: isCorrect ? input.points.toNumber() : 0,
    };
  }

  private isAnswerCorrect(input: CorrectionInput): boolean {
    if (!input.submittedAnswer) {
      return false;
    }

    if (input.type === QuestionType.MULTIPLE_CHOICE) {
      return this.correctMultipleChoice(input.officialAnswers, input.submittedAnswer);
    }

    return this.correctAnswerMap(input.officialAnswers, input.submittedAnswer);
  }

  private correctMultipleChoice(
    officialAnswers: QuestionAnswer[],
    submittedAnswer: Prisma.JsonValue,
  ): boolean {
    const officialAnswer = officialAnswers.find(
      (answer) => answer.answerKey === 'correctAnswer',
    );
    const submittedValue = this.extractSingleAnswer(submittedAnswer);

    return Boolean(
      officialAnswer &&
        submittedValue &&
        this.normalizeAnswer(officialAnswer.answerValue) ===
          this.normalizeAnswer(submittedValue),
    );
  }

  private correctAnswerMap(
    officialAnswers: QuestionAnswer[],
    submittedAnswer: Prisma.JsonValue,
  ): boolean {
    const submittedMap = this.extractAnswerMap(submittedAnswer);

    if (!submittedMap) {
      return false;
    }

    return officialAnswers.every((officialAnswer) => {
      const submittedValue = submittedMap[officialAnswer.answerKey];

      return (
        submittedValue !== undefined &&
        this.normalizeAnswer(String(submittedValue)) ===
          this.normalizeAnswer(officialAnswer.answerValue)
      );
    });
  }

  private extractSingleAnswer(answer: Prisma.JsonValue): string | null {
    if (typeof answer === 'string' || typeof answer === 'number') {
      return String(answer);
    }

    if (!this.isRecord(answer)) {
      return null;
    }

    const candidateKeys = ['answer', 'value', 'optionKey', 'selectedOption'];

    for (const key of candidateKeys) {
      const value = answer[key];

      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }

    return null;
  }

  private extractAnswerMap(
    answer: Prisma.JsonValue,
  ): Record<string, string | number | boolean> | null {
    if (!this.isRecord(answer)) {
      return null;
    }

    const nestedAnswers = answer.answers;

    if (this.isRecord(nestedAnswers)) {
      return this.filterPrimitiveMap(nestedAnswers);
    }

    return this.filterPrimitiveMap(answer);
  }

  private filterPrimitiveMap(
    value: Record<string, unknown>,
  ): Record<string, string | number | boolean> {
    return Object.fromEntries(
      Object.entries(value).filter(([, entryValue]) =>
        ['string', 'number', 'boolean'].includes(typeof entryValue),
      ),
    ) as Record<string, string | number | boolean>;
  }

  private normalizeAnswer(value: string): string {
    return value.trim().toLowerCase();
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }
}
