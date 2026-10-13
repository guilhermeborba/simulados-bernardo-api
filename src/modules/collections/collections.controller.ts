import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CollectionsService } from './collections.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get('achievements')
  achievements(@CurrentUser() user: AuthenticatedUser) {
    return this.collections.achievements(user.id);
  }

  @Get('avatar')
  avatar(@CurrentUser() user: AuthenticatedUser) {
    return this.collections.avatar(user.id);
  }

  @Patch('avatar')
  updateAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAvatarDto,
  ) {
    return this.collections.updateAvatar(user.id, dto);
  }
}
