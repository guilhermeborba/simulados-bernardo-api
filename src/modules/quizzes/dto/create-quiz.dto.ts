import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class QuizOptionDto {
  @Transform(trimString)
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+$/)
  @MaxLength(40)
  optionKey!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;
}

export class QuizImageMediaDto {
  @Transform(trimString)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9._-]*$/)
  @MaxLength(120)
  assetId!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  alt!: string;
}

export class QuizAudioMediaDto {
  @Transform(trimString)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9._-]*$/)
  @MaxLength(120)
  assetId!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  transcript!: string;
}

export class QuizMediaDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuizImageMediaDto)
  image?: QuizImageMediaDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuizAudioMediaDto)
  audio?: QuizAudioMediaDto;
}

export class QuizQuestionDto {
  @Transform(trimString)
  @IsString()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/)
  @MaxLength(120)
  originKey!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  statement!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  explanation!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  tip?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  funFact?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuizMediaDto)
  media?: QuizMediaDto | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999.99)
  points!: number;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options!: QuizOptionDto[];

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  correctAnswer!: string;
}

export class CreateQuizDto {
  @Transform(trimString)
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9._:-]*$/)
  @MaxLength(120)
  activityKey!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  disciplineId!: string;

  @IsInt()
  @Min(-2)
  @Max(12)
  schoolYear!: number;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  topic!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(240)
  subtitle?: string | null;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  turmaId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  estimatedDurationMinutes?: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions!: QuizQuestionDto[];
}
