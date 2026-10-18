import { IsBoolean, IsOptional } from "class-validator";

export class StartAttemptDto {
  @IsOptional()
  @IsBoolean()
  immediateFeedback?: boolean;
}
