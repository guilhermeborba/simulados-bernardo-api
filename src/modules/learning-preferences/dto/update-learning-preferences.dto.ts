import { LearningSegment } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateLearningPreferencesDto {
  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsEnum(LearningSegment)
  segment?: LearningSegment | null;

  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsInt()
  @Min(-2)
  @Max(12)
  schoolYear?: number | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  audioEnabled?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  motionEnabled?: boolean;
}
