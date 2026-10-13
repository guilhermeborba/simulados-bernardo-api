import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionsService } from './missions.service';

@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MissionsController {
  constructor(private readonly missions: MissionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.missions.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.missions.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() dto: CreateMissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missions.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missions.update(id, dto, user.id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.missions.publish(id, user.id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.missions.archive(id, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.missions.softDelete(id, user.id);
  }
}
