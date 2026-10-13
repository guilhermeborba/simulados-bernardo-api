import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LearningQueryDto } from './dto/learning-query.dto';
import { LearningService } from './learning.service';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('learning-home')
  home(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LearningQueryDto,
  ) {
    return this.learning.home(user.id, query.schoolYear);
  }

  @Get('missions')
  missions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LearningQueryDto,
  ) {
    return this.learning.missions(user.id, query.schoolYear);
  }
}
