import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma/prisma.service';
import { DisciplinesService } from './disciplines.service';

describe('DisciplinesService', () => {
  let service: DisciplinesService;
  let prisma: {
    discipline: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      discipline: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DisciplinesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(DisciplinesService);
  });

  it('creates discipline with normalized slug', async () => {
    prisma.discipline.findUnique.mockResolvedValue(null);
    prisma.discipline.create.mockResolvedValue({
      id: 'discipline-1',
      name: 'Matemática',
      slug: 'matematica',
    });

    await service.create({
      name: 'Matemática',
      themeColor: '#0055AA',
    });

    expect(prisma.discipline.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Matemática',
        slug: 'matematica',
        isActive: true,
      }),
    });
  });

  it('rejects duplicated slugs', async () => {
    prisma.discipline.findUnique.mockResolvedValue({
      id: 'existing-discipline',
      slug: 'matematica',
    });

    await expect(
      service.create({
        name: 'Matemática',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
