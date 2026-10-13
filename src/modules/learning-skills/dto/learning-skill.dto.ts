import { Transform } from 'class-transformer';
import {
  Equals,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { SCHOOL_YEARS } from '../../learning/learning-calendar';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
export class CreateLearningSkillDto {
  @Transform(trim)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9._:-]*$/)
  @MaxLength(120)
  code!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version?: number;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  description!: string;
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  disciplineId!: string;
  @IsInt() @IsIn(SCHOOL_YEARS) schoolYear!: number;
}
export class PublishLearningSkillDto {
  @Equals(true) reviewConfirmed!: true;
}
export class StartReviewDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(120) quizId!: string;
}
