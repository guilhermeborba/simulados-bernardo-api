import { IsString, MaxLength, MinLength } from 'class-validator';

export class RedeemInviteDto {
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  token!: string;
}
