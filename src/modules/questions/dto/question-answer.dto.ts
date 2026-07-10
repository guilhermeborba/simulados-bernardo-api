import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class QuestionAnswerDto {
  @IsString()
  @MaxLength(80)
  answerKey!: string;

  @IsString()
  @MaxLength(1000)
  answerValue!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
