import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SimulationStatus } from '@prisma/client';
import { slugify } from '../../common/utils/slugify';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { FindAvailableSimulationsDto } from './dto/find-available-simulations.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.simulation.findMany({
      where: { deletedAt: null },
      include: { discipline: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAvailable(filters: FindAvailableSimulationsDto) {
    const where: Prisma.SimulationWhereInput = {
      status: SimulationStatus.PUBLISHED,
      deletedAt: null,
      discipline: {
        isActive: true,
        deletedAt: null,
        ...(filters.discipline ? { slug: filters.discipline } : {}),
      },
      ...(filters.schoolYear ? { schoolYear: filters.schoolYear } : {}),
      ...(filters.bimester ? { bimester: filters.bimester } : {}),
      ...(filters.assessment
        ? { assessment: filters.assessment.trim().toUpperCase() }
        : {}),
    };

    return this.prisma.simulation.findMany({
      where,
      include: { discipline: true },
      orderBy: [{ schoolYear: 'asc' }, { bimester: 'asc' }, { title: 'asc' }],
    });
  }

  async findByIdOrThrow(id: string) {
    const simulation = await this.prisma.simulation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: { discipline: true },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    return simulation;
  }

  async create(dto: CreateSimulationDto, createdById: string) {
    await this.assertDisciplineExists(dto.disciplineId);

    const slug = slugify(
      dto.slug ??
        `${dto.title}-${dto.schoolYear}-ano-${dto.bimester}-bimestre-${dto.assessment}`,
    );
    await this.assertSlugAvailable(slug);

    return this.prisma.simulation.create({
      data: {
        title: dto.title.trim(),
        subtitle: dto.subtitle?.trim(),
        slug,
        schoolYear: dto.schoolYear,
        bimester: dto.bimester,
        assessment: dto.assessment.trim().toUpperCase(),
        disciplineId: dto.disciplineId,
        totalQuestions: dto.totalQuestions,
        maxScore: dto.maxScore,
        estimatedDurationMinutes: dto.estimatedDurationMinutes,
        createdById,
      },
      include: { discipline: true },
    });
  }

  async update(id: string, dto: UpdateSimulationDto) {
    await this.findByIdOrThrow(id);

    if (dto.disciplineId) {
      await this.assertDisciplineExists(dto.disciplineId);
    }

    const data: Prisma.SimulationUpdateInput = {
      ...(dto.title ? { title: dto.title.trim() } : {}),
      ...(dto.subtitle !== undefined
        ? { subtitle: dto.subtitle?.trim() }
        : {}),
      ...(dto.schoolYear !== undefined ? { schoolYear: dto.schoolYear } : {}),
      ...(dto.bimester !== undefined ? { bimester: dto.bimester } : {}),
      ...(dto.assessment
        ? { assessment: dto.assessment.trim().toUpperCase() }
        : {}),
      ...(dto.disciplineId
        ? { discipline: { connect: { id: dto.disciplineId } } }
        : {}),
      ...(dto.totalQuestions !== undefined
        ? { totalQuestions: dto.totalQuestions }
        : {}),
      ...(dto.maxScore !== undefined ? { maxScore: dto.maxScore } : {}),
      ...(dto.estimatedDurationMinutes !== undefined
        ? { estimatedDurationMinutes: dto.estimatedDurationMinutes }
        : {}),
    };

    if (dto.slug || dto.title) {
      const slug = slugify(dto.slug ?? dto.title ?? '');
      await this.assertSlugAvailable(slug, id);
      data.slug = slug;
    }

    return this.prisma.simulation.update({
      where: { id },
      data,
      include: { discipline: true },
    });
  }

  async publish(id: string) {
    const simulation = await this.findByIdOrThrow(id);
    const activeQuestions = await this.prisma.question.count({
      where: {
        simulationId: id,
        isActive: true,
        deletedAt: null,
      },
    });

    if (simulation.totalQuestions <= 0 || activeQuestions <= 0) {
      throw new BadRequestException(
        'Simulation must have active questions before publishing',
      );
    }

    if (activeQuestions !== simulation.totalQuestions) {
      throw new BadRequestException(
        'Active question count must match simulation totalQuestions',
      );
    }

    return this.prisma.simulation.update({
      where: { id },
      data: {
        status: SimulationStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: { discipline: true },
    });
  }

  async archive(id: string) {
    await this.findByIdOrThrow(id);

    return this.prisma.simulation.update({
      where: { id },
      data: {
        status: SimulationStatus.ARCHIVED,
      },
      include: { discipline: true },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    await this.prisma.simulation.update({
      where: { id },
      data: {
        status: SimulationStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }

  async updateQuestionTotals(simulationId: string): Promise<void> {
    const questions = await this.prisma.question.findMany({
      where: {
        simulationId,
        isActive: true,
        deletedAt: null,
      },
      select: { points: true },
    });

    await this.prisma.simulation.update({
      where: { id: simulationId },
      data: {
        totalQuestions: questions.length,
        maxScore: questions.reduce(
          (total, question) => total + question.points.toNumber(),
          0,
        ),
      },
    });
  }

  private async assertDisciplineExists(disciplineId: string) {
    const discipline = await this.prisma.discipline.findFirst({
      where: {
        id: disciplineId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!discipline) {
      throw new BadRequestException('Active discipline not found');
    }
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    if (!slug) {
      throw new ConflictException('Invalid simulation slug');
    }

    const existing = await this.prisma.simulation.findUnique({
      where: { slug },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Simulation slug already exists');
    }
  }
}
