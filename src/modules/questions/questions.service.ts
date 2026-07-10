import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SimulationsService } from '../simulations/simulations.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionDto } from './dto/reorder-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulationsService: SimulationsService,
  ) {}

  findBySimulation(simulationId: string) {
    return this.prisma.question.findMany({
      where: {
        simulationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByIdOrThrow(id: string) {
    const question = await this.prisma.question.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(simulationId: string, dto: CreateQuestionDto) {
    await this.simulationsService.findByIdOrThrow(simulationId);
    await this.assertOrderAvailable(simulationId, dto.order);

    const question = await this.prisma.question.create({
      data: {
        simulationId,
        type: dto.type,
        statement: dto.statement.trim(),
        tip: dto.tip?.trim(),
        points: dto.points,
        sortOrder: dto.order,
        isActive: dto.isActive ?? true,
        options: {
          create: dto.options.map((option) => ({
            optionKey: option.optionKey.trim(),
            text: option.text.trim(),
            groupKey: option.groupKey?.trim(),
            sortOrder: option.order,
            metadata: option.metadata as Prisma.InputJsonValue,
          })),
        },
        answers: {
          create: dto.answers.map((answer) => ({
            answerKey: answer.answerKey.trim(),
            answerValue: answer.answerValue.trim(),
            metadata: answer.metadata as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    await this.simulationsService.updateQuestionTotals(simulationId);

    return question;
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const existingQuestion = await this.findByIdOrThrow(id);

    if (dto.order && dto.order !== existingQuestion.sortOrder) {
      await this.assertOrderAvailable(existingQuestion.simulationId, dto.order, id);
    }

    const question = await this.prisma.$transaction(async (transaction) => {
      await transaction.question.update({
        where: { id },
        data: {
          ...(dto.type ? { type: dto.type } : {}),
          ...(dto.statement ? { statement: dto.statement.trim() } : {}),
          ...(dto.tip !== undefined ? { tip: dto.tip?.trim() } : {}),
          ...(dto.points !== undefined ? { points: dto.points } : {}),
          ...(dto.order !== undefined ? { sortOrder: dto.order } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });

      if (dto.options) {
        await transaction.questionOption.deleteMany({
          where: { questionId: id },
        });
        await transaction.questionOption.createMany({
          data: dto.options.map((option) => ({
            questionId: id,
            optionKey: option.optionKey.trim(),
            text: option.text.trim(),
            groupKey: option.groupKey?.trim(),
            sortOrder: option.order,
            metadata: option.metadata as Prisma.InputJsonValue,
          })),
        });
      }

      if (dto.answers) {
        await transaction.questionAnswer.deleteMany({
          where: { questionId: id },
        });
        await transaction.questionAnswer.createMany({
          data: dto.answers.map((answer) => ({
            questionId: id,
            answerKey: answer.answerKey.trim(),
            answerValue: answer.answerValue.trim(),
            metadata: answer.metadata as Prisma.InputJsonValue,
          })),
        });
      }

      return transaction.question.findUniqueOrThrow({
        where: { id },
        include: {
          options: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });

    await this.simulationsService.updateQuestionTotals(
      existingQuestion.simulationId,
    );

    return question;
  }

  async reorder(id: string, dto: ReorderQuestionDto) {
    const question = await this.findByIdOrThrow(id);

    if (question.sortOrder !== dto.order) {
      await this.assertOrderAvailable(question.simulationId, dto.order, id);
    }

    return this.update(id, { order: dto.order });
  }

  async softDelete(id: string): Promise<void> {
    const question = await this.findByIdOrThrow(id);

    await this.prisma.question.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await this.simulationsService.updateQuestionTotals(question.simulationId);
  }

  private async assertOrderAvailable(
    simulationId: string,
    order: number,
    currentQuestionId?: string,
  ) {
    const existing = await this.prisma.question.findFirst({
      where: {
        simulationId,
        sortOrder: order,
        deletedAt: null,
      },
    });

    if (existing && existing.id !== currentQuestionId) {
      throw new ConflictException('Question order already exists');
    }
  }
}
