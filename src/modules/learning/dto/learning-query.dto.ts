import { Transform } from 'class-transformer';
import { IsIn, IsInt, ValidateIf } from 'class-validator';
import { SCHOOL_YEARS } from '../learning-calendar';

export class LearningQueryDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^-?\d+$/.test(value.trim())
      ? Number(value)
      : value,
  )
  @IsInt()
  @IsIn(SCHOOL_YEARS)
  schoolYear?: number;
}
