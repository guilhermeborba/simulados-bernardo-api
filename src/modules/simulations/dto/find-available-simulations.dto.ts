import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAvailableSimulationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  schoolYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  bimester?: number;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  discipline?: string;
}
