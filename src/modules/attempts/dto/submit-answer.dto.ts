import { IsObject } from 'class-validator';

export class SubmitAnswerDto {
  @IsObject()
  answer!: Record<string, unknown>;
}
