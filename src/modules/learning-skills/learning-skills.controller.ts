import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LearningQueryDto } from '../learning/dto/learning-query.dto';
import {
  CreateLearningSkillDto,
  PublishLearningSkillDto,
} from './dto/learning-skill.dto';
import { LearningSkillsService } from './learning-skills.service';
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningSkillsController {
  constructor(private readonly skills: LearningSkillsService) {}
  @Get('me/learning-progress')
  @Roles(UserRole.STUDENT)
  progress(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LearningQueryDto,
  ) {
    return this.skills.progress(user.id, query.schoolYear);
  }
  @Get('learning-skills')
  @Roles(UserRole.ADMIN)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.skills.list(user.id);
  }
  @Post('learning-skills')
  @Roles(UserRole.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLearningSkillDto,
  ) {
    return this.skills.create(dto, user.id);
  }
  @Patch('learning-skills/:id/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: PublishLearningSkillDto,
  ) {
    return this.skills.publish(id, user.id, dto.reviewConfirmed);
  }
  @Patch('learning-skills/:id/archive')
  @Roles(UserRole.ADMIN)
  archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.skills.archive(id, user.id);
  }
}
