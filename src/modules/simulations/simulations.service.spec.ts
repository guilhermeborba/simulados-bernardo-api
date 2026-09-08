import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SimulationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from '../turmas/turmas.service';
import { SimulationsService } from './simulations.service';

describe('SimulationsService', () => {
  let service: SimulationsService;
  let prisma: {
    simulation: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    question: {
      count: jest.Mock;
    };
  };

  let turmas: { accessibleTurmaIds: jest.Mock };

  beforeEach(async () => {
    turmas = { accessibleTurmaIds: jest.fn().mockResolvedValue([]) };
    prisma = {
      simulation: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      question: {
        count: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SimulationsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: TurmasService,
          useValue: turmas,
        },
      ],
    }).compile();

    service = moduleRef.get(SimulationsService);
  });

  it('keeps schoolYear 0 as a filter so técnico simulations are not mixed in', async () => {
    await service.findAvailable({ schoolYear: 0 });

    expect(prisma.simulation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ schoolYear: 0 }),
      }),
    );
  });

  it('omits the schoolYear filter when it was not informed', async () => {
    await service.findAvailable({});

    const where = prisma.simulation.findMany.mock.calls[0][0].where;
    expect(where).not.toHaveProperty('schoolYear');
  });

  it('hides turma simulations from anonymous visitors', async () => {
    await service.findAvailable({});

    const where = prisma.simulation.findMany.mock.calls[0][0].where;
    expect(where.turmaId).toBeNull();
  });

  it('shows public simulations plus the ones of turmas the student belongs to', async () => {
    turmas.accessibleTurmaIds.mockResolvedValue(['turma-1']);

    await service.findAvailable({}, { id: 'aluno-1', role: UserRole.STUDENT });

    const where = prisma.simulation.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([{ turmaId: null }, { turmaId: { in: ['turma-1'] } }]);
  });

  it('hides nothing from an admin', async () => {
    await service.findAvailable({}, { id: 'admin-1', role: UserRole.ADMIN });

    const where = prisma.simulation.findMany.mock.calls[0][0].where;
    expect(where).not.toHaveProperty('turmaId');
    expect(where).not.toHaveProperty('OR');
  });

  it('publishes simulation when active question count matches total', async () => {
    prisma.simulation.findFirst.mockResolvedValue({
      id: 'simulation-1',
      totalQuestions: 2,
    });
    prisma.question.count.mockResolvedValue(2);
    prisma.simulation.update.mockResolvedValue({
      id: 'simulation-1',
      status: SimulationStatus.PUBLISHED,
    });

    await expect(service.publish('simulation-1')).resolves.toMatchObject({
      status: SimulationStatus.PUBLISHED,
    });
    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: 'simulation-1' },
      data: expect.objectContaining({
        status: SimulationStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      }),
      include: { discipline: true },
    });
  });

  it('rejects publish when active question count does not match total', async () => {
    prisma.simulation.findFirst.mockResolvedValue({
      id: 'simulation-1',
      totalQuestions: 2,
    });
    prisma.question.count.mockResolvedValue(1);

    await expect(service.publish('simulation-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
