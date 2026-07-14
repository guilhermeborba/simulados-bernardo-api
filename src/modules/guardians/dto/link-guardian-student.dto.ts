import { IsString, MaxLength, MinLength } from 'class-validator';

export class LinkGuardianStudentDto {
  @IsString()
  guardianId!: string;

  @IsString()
  studentId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  relationship!: string;
}
