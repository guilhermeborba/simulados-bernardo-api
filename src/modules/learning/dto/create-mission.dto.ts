import { Transform } from 'class-transformer';
import { LearningSegment } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SCHOOL_YEARS } from '../learning-calendar';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateMissionDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @IsEnum(LearningSegment)
  segment!: LearningSegment;

  @IsInt()
  @IsIn(SCHOOL_YEARS)
  schoolYear!: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  weekStart!: string;

  @IsInt()
  @IsIn([1, 2])
  slot!: number;

  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  turmaId?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^[a-z0-9][a-z0-9-]{0,119}$/, { each: true })
  activityKeys!: string[];
}
