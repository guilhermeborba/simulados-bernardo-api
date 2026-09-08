import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateInviteDto {
  /** Só para o professor lembrar de onde veio o link. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUses?: number;
}
