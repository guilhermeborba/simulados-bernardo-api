import { IsString } from 'class-validator';
import { SubmitAnswerDto } from './submit-answer.dto';

export class SubmitAttemptAnswerDto extends SubmitAnswerDto {
  @IsString()
  questionId!: string;
}
