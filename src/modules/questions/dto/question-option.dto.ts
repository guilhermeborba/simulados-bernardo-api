import { Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class QuestionOptionDto {
  @IsString()
  @MaxLength(40)
  optionKey!: string;

  @IsString()
  @MaxLength(1000)
  text!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  groupKey?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
