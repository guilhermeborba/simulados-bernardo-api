import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../../common/utils/slugify';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(private readonly prisma: PrismaService) {}

  findActive() {
    return this.prisma.discipline.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  findAll() {
    return this.prisma.discipline.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdOrThrow(id: string) {
    const discipline = await this.prisma.discipline.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!discipline) {
      throw new NotFoundException('Discipline not found');
    }

    return discipline;
  }

  async create(dto: CreateDisciplineDto) {
    const slug = slugify(dto.slug ?? dto.name);

    await this.assertSlugAvailable(slug);

    return this.prisma.discipline.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        icon: dto.icon?.trim(),
        themeColor: dto.themeColor,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDisciplineDto) {
    await this.findByIdOrThrow(id);

    const data: Prisma.DisciplineUpdateInput = {
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description?.trim() }
        : {}),
      ...(dto.icon !== undefined ? { icon: dto.icon?.trim() } : {}),
      ...(dto.themeColor !== undefined ? { themeColor: dto.themeColor } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    if (dto.slug || dto.name) {
      const slug = slugify(dto.slug ?? dto.name ?? '');
      await this.assertSlugAvailable(slug, id);
      data.slug = slug;
    }

    return this.prisma.discipline.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    await this.prisma.discipline.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  private async assertSlugAvailable(slug: string, currentId?: string) {
    if (!slug) {
      throw new ConflictException('Invalid discipline slug');
    }

    const existing = await this.prisma.discipline.findUnique({
      where: { slug },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Discipline slug already exists');
    }
  }
}
