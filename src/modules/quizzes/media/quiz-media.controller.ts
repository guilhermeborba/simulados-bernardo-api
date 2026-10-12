import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  JwtAuthGuard,
} from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { QuizAttemptsService } from '../../attempts/quiz-attempts.service';
import { readQuizMediaAsset } from './quiz-media';

@Controller('attempts/:attemptId/questions/:questionId/media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizMediaController {
  constructor(private readonly attempts: QuizAttemptsService) {}

  @Get(':kind')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async getMedia(
    @Param('attemptId') attemptId: string,
    @Param('questionId') questionId: string,
    @Param('kind') kind: string,
    @Headers('range') range: string | undefined,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (kind !== 'image' && kind !== 'audio') {
      throw new BadRequestException('Quiz media kind must be image or audio');
    }
    const reference = await this.attempts.getMediaReference(
      attemptId,
      questionId,
      kind,
      user,
    );
    const asset = readQuizMediaAsset(reference.assetId, kind, reference.sha256);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; sandbox",
    );
    response.setHeader(
      'Content-Disposition',
      `inline; filename="quiz-${kind}.${kind === 'image' ? 'svg' : 'wav'}"`,
    );
    response.setHeader('Accept-Ranges', 'bytes');
    let bytes = asset.bytes;
    if (range !== undefined) {
      const bounds = parseQuizMediaRange(range, asset.byteLength);
      if (!bounds) {
        response.setHeader('Content-Range', `bytes */${asset.byteLength}`);
        throw new HttpException('Requested quiz media range is invalid', 416);
      }
      const [start, end] = bounds;
      response.status(206);
      response.setHeader(
        'Content-Range',
        `bytes ${start}-${end}/${asset.byteLength}`,
      );
      bytes = asset.bytes.subarray(start, end + 1);
    }
    return new StreamableFile(bytes, {
      type: asset.mimeType,
      length: bytes.length,
    });
  }
}

function parseQuizMediaRange(
  range: string,
  size: number,
): [number, number] | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return null;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null;
    return [Math.max(0, size - suffix), size - 1];
  }
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start >= size ||
    requestedEnd < start
  )
    return null;
  return [start, Math.min(size - 1, requestedEnd)];
}
