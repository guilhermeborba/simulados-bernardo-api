import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { UpdateLearningPreferencesDto } from './dto/update-learning-preferences.dto';
import { LearningPreferencesService } from './learning-preferences.service';

@Controller('me/learning-preferences')
@UseGuards(JwtAuthGuard)
export class LearningPreferencesController {
  constructor(private readonly preferences: LearningPreferencesService) {}

  @Get()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.preferences.getMe(user.id);
  }

  @Patch()
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLearningPreferencesDto,
  ) {
    return this.preferences.updateMe(user.id, dto);
  }
}
