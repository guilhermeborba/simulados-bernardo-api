import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SimulationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SimulationsService } from './simulations.service';

describe('SimulationsService', () => {
  let service: SimulationsService;
  let prisma: {
    simulation: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    question: {
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      simulation: {
        findFirst: jest.fn(),
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
      ],
    }).compile();

    service = moduleRef.get(SimulationsService);
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
