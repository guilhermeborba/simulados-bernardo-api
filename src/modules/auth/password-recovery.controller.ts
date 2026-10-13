import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password-recovery.dto';
import { PasswordRecoveryService } from './password-recovery.service';

@Controller('auth')
export class PasswordRecoveryController {
  constructor(private readonly recovery: PasswordRecoveryService) {}
  @Post('forgot-password')
  @HttpCode(202)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.recovery.forgotPassword(dto.email);
  }
  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  reset(@Body() dto: ResetPasswordDto) {
    return this.recovery.resetPassword(dto);
  }
}
