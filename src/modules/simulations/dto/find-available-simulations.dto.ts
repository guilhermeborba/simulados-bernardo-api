import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAvailableSimulationsDto {
  // Zero é um valor legítimo: curso técnico não tem ano escolar e é gravado
  // com schoolYear 0. A regra anterior (@Min(1)) foi escrita antes de existir
  // curso técnico e rejeitava a listagem deles.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(12)
  schoolYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  bimester?: number;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  discipline?: string;
}
