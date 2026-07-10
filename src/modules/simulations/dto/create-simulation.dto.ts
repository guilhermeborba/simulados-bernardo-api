import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSimulationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  slug?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  schoolYear!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  bimester!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  assessment!: string;

  @IsString()
  disciplineId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalQuestions!: number;

  @Type(() => Number)
  @Min(0)
  maxScore!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(600)
  estimatedDurationMinutes?: number;
}
