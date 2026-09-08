import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  /** Token do link de convite, quando o cadastro veio por uma turma. */
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  inviteToken?: string;
}
