import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  schoolYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  className?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  schoolName?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;
}
