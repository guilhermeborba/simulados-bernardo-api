import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { FindAvailableSimulationsDto } from './dto/find-available-simulations.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';
import { SimulationsService } from './simulations.service';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  // Continua aberta: a porta de entrada lista o catálogo público antes do
  // login. O guard só identifica quem já está autenticado, para que o conteúdo
  // de turma apareça para os membros.
  @Get('available')
  @UseGuards(OptionalJwtAuthGuard)
  findAvailable(
    @Query() filters: FindAvailableSimulationsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.simulationsService.findAvailable(filters, user ?? null);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.simulationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.simulationsService.findByIdOrThrow(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateSimulationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.simulationsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
    return this.simulationsService.update(id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  publish(@Param('id') id: string) {
    return this.simulationsService.publish(id);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  archive(@Param('id') id: string) {
    return this.simulationsService.archive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.simulationsService.softDelete(id);
  }
}
