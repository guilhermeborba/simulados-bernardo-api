import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAvailableSimulationsDto {
  // Zero é um valor legítimo: curso técnico não tem ano escolar e é gravado
  // com schoolYear 0. Negativos também são legítimos: são os sentinelas da
  // Educação Infantil (-1 = Infantil 4 anos, -2 = Infantil 5 anos — ver
  // INFANTIL_4_SCHOOL_YEAR/INFANTIL_5_SCHOOL_YEAR no frontend, lib/trilha.ts).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-2)
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
