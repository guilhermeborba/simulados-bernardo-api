import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class AssignTeacherDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  teacherId!: string;
}
