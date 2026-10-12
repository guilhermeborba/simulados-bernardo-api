import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';

// Logical identity never changes; subsequent content is a new version.
export class UpdateQuizDto extends PartialType(
  OmitType(CreateQuizDto, ['activityKey'] as const),
  { skipNullProperties: false },
) {}
