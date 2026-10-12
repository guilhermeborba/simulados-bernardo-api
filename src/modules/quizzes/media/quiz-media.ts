import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { constants, closeSync, fstatSync, openSync, readSync } from 'node:fs';
import { join } from 'node:path';

export type QuizMediaKind = 'image' | 'audio';

export interface QuizMediaAsset {
  id: string;
  kind: QuizMediaKind;
  file: string;
  mimeType: 'image/svg+xml' | 'audio/wav';
  sha256: string;
  byteLength: number;
}

export interface StoredQuizMedia {
  image?: { assetId: string; sha256: string; alt: string };
  audio?: { assetId: string; sha256: string; transcript: string };
}

export interface QuizMediaBytes {
  bytes: Buffer;
  mimeType: QuizMediaAsset['mimeType'];
  byteLength: number;
}

const ASSET_ID = /^[a-z0-9][a-z0-9._-]{0,119}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const MAX_BYTES = { image: 2 * 1024 * 1024, audio: 8 * 1024 * 1024 };
const MANIFEST_MAX_BYTES = 1024 * 1024;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function validText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function parseMedia(value: unknown, stored: boolean): StoredQuizMedia | null {
  if (value === null || value === undefined) return null;
  if (
    !record(value) ||
    !hasOnlyKeys(value, ['image', 'audio']) ||
    Object.keys(value).length === 0
  ) {
    throw new Error('Invalid media');
  }
  const result: StoredQuizMedia = {};
  for (const kind of ['image', 'audio'] as const) {
    if (!(kind in value)) continue;
    const item = value[kind];
    const textKey = kind === 'image' ? 'alt' : 'transcript';
    const keys = ['assetId', textKey, ...(stored ? ['sha256'] : [])];
    if (
      !record(item) ||
      !hasOnlyKeys(item, keys) ||
      Object.keys(item).length !== keys.length ||
      typeof item.assetId !== 'string' ||
      !ASSET_ID.test(item.assetId) ||
      !validText(item[textKey], kind === 'image' ? 1000 : 5000) ||
      (stored && (typeof item.sha256 !== 'string' || !SHA256.test(item.sha256)))
    ) {
      throw new Error('Invalid media');
    }
    const sha256 = stored ? (item.sha256 as string) : '';
    if (kind === 'image') {
      result.image = {
        assetId: item.assetId,
        sha256,
        alt: (item.alt as string).trim(),
      };
    } else {
      result.audio = {
        assetId: item.assetId,
        sha256,
        transcript: (item.transcript as string).trim(),
      };
    }
  }
  return result;
}

// Snapshot readers deliberately validate shape without consulting the filesystem.
// Text, confirmation and results remain available if a packaged file is missing.
export function parseStoredQuizMedia(value: unknown): StoredQuizMedia | null {
  try {
    return parseMedia(value, true);
  } catch {
    throw new InternalServerErrorException('Quiz media metadata is invalid');
  }
}

function boundedFile(path: string, maxBytes: number): Buffer {
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.size < 1 || stat.size > maxBytes) {
      throw new Error('Invalid asset size');
    }
    const bytes = Buffer.alloc(stat.size);
    let position = 0;
    while (position < bytes.length) {
      const count = readSync(
        descriptor,
        bytes,
        position,
        bytes.length - position,
        position,
      );
      if (count === 0) throw new Error('Incomplete asset');
      position += count;
    }
    if (readSync(descriptor, Buffer.alloc(1), 0, 1, bytes.length) !== 0) {
      throw new Error('Asset size changed');
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

function assertSafeSvg(bytes: Buffer): void {
  const source = bytes.toString('utf8');
  if (
    !Buffer.from(source, 'utf8').equals(bytes) ||
    !/^\s*(?:<\?xml[^?]*\?>\s*)?<svg\b/i.test(source) ||
    !/<\/svg>\s*$/i.test(source) ||
    /<!|<\?(?!xml\b)|&(?!amp;|lt;|gt;|quot;|apos;)|\bon[a-z]+\s*=|\bhref\s*=|\bstyle\s*=|\burl\s*\(|javascript:|data:|https?:/i.test(
      source.replace(/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/g, ''),
    )
  ) {
    throw new Error('Unsafe SVG');
  }
  const allowedTags = new Set([
    'svg',
    'g',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'path',
    'text',
    'tspan',
    'title',
    'desc',
    'defs',
    'clippath',
  ]);
  for (const tag of source.matchAll(/<\/?\s*([a-z][a-z0-9:-]*)\b/gi)) {
    if (!allowedTags.has(tag[1].toLowerCase())) throw new Error('Unsafe SVG');
  }
}

function assertPcmWav(bytes: Buffer): void {
  if (
    bytes.length < 44 ||
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WAVE' ||
    bytes.readUInt32LE(4) + 8 !== bytes.length
  ) {
    throw new Error('Invalid WAV');
  }
  let offset = 12;
  let blockAlign = 0;
  let dataSize = 0;
  while (offset + 8 <= bytes.length) {
    const chunk = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) throw new Error('Invalid WAV');
    if (chunk === 'fmt ') {
      if (size < 16 || blockAlign !== 0) throw new Error('Invalid WAV');
      const channels = bytes.readUInt16LE(start + 2);
      const sampleRate = bytes.readUInt32LE(start + 4);
      blockAlign = bytes.readUInt16LE(start + 12);
      if (
        bytes.readUInt16LE(start) !== 1 ||
        ![1, 2].includes(channels) ||
        sampleRate < 8000 ||
        sampleRate > 48000 ||
        bytes.readUInt16LE(start + 14) !== 16 ||
        blockAlign !== channels * 2 ||
        bytes.readUInt32LE(start + 8) !== sampleRate * blockAlign
      ) {
        throw new Error('Invalid WAV');
      }
    } else if (chunk === 'data') {
      if (dataSize !== 0) throw new Error('Invalid WAV');
      dataSize = size;
    }
    offset = start + size + (size % 2);
  }
  if (
    offset !== bytes.length ||
    !blockAlign ||
    !dataSize ||
    dataSize % blockAlign
  ) {
    throw new Error('Invalid WAV');
  }
}

export class QuizMediaRegistry {
  constructor(private readonly assetsDirectory = join(__dirname, 'assets')) {}

  get(assetId: string, kind: QuizMediaKind): QuizMediaAsset {
    if (!ASSET_ID.test(assetId) || !['image', 'audio'].includes(kind)) {
      throw new BadRequestException('Registered quiz media asset not found');
    }
    try {
      const manifest: unknown = JSON.parse(
        boundedFile(
          join(this.assetsDirectory, 'manifest.json'),
          MANIFEST_MAX_BYTES,
        ).toString('utf8'),
      );
      if (!Array.isArray(manifest) || manifest.length > 1000) {
        throw new Error('Invalid media manifest');
      }
      const ids = new Set<string>();
      let match: QuizMediaAsset | undefined;
      for (const entry of manifest) {
        if (
          !record(entry) ||
          !hasOnlyKeys(entry, [
            'id',
            'kind',
            'file',
            'mimeType',
            'sha256',
            'byteLength',
          ]) ||
          Object.keys(entry).length !== 6 ||
          typeof entry.id !== 'string' ||
          !ASSET_ID.test(entry.id) ||
          ids.has(entry.id) ||
          !['image', 'audio'].includes(entry.kind as string) ||
          typeof entry.file !== 'string' ||
          !/^[a-z0-9][a-z0-9._-]*\.(svg|wav)$/.test(entry.file) ||
          entry.file.includes('..') ||
          typeof entry.sha256 !== 'string' ||
          !SHA256.test(entry.sha256) ||
          typeof entry.byteLength !== 'number' ||
          !Number.isInteger(entry.byteLength) ||
          entry.byteLength < 1
        ) {
          throw new Error('Invalid media manifest');
        }
        const entryKind = entry.kind as QuizMediaKind;
        if (
          entry.byteLength > MAX_BYTES[entryKind] ||
          (entryKind === 'image' &&
            (entry.mimeType !== 'image/svg+xml' ||
              !entry.file.endsWith('.svg'))) ||
          (entryKind === 'audio' &&
            (entry.mimeType !== 'audio/wav' || !entry.file.endsWith('.wav')))
        ) {
          throw new Error('Invalid media manifest');
        }
        ids.add(entry.id);
        if (entry.id === assetId && entryKind === kind) {
          match = { ...entry } as unknown as QuizMediaAsset;
        }
      }
      if (!match) throw new Error('Unknown media asset');
      return match;
    } catch {
      throw new BadRequestException('Registered quiz media asset not found');
    }
  }

  read(assetId: string, kind: QuizMediaKind, sha256: string): QuizMediaBytes {
    try {
      if (!SHA256.test(sha256)) throw new Error('Invalid pinned asset hash');
      const entry = this.get(assetId, kind);
      if (entry.sha256 !== sha256) throw new Error('Asset version unavailable');
      const bytes = boundedFile(
        join(this.assetsDirectory, entry.file),
        MAX_BYTES[kind],
      );
      if (
        bytes.length !== entry.byteLength ||
        createHash('sha256').update(bytes).digest('hex') !== sha256
      ) {
        throw new Error('Asset integrity mismatch');
      }
      if (kind === 'image') assertSafeSvg(bytes);
      else assertPcmWav(bytes);
      return { bytes, mimeType: entry.mimeType, byteLength: bytes.length };
    } catch {
      throw new NotFoundException('Quiz media asset unavailable');
    }
  }

  normalize(input: unknown): StoredQuizMedia | null {
    try {
      const result = parseMedia(input, false);
      if (!result) return null;
      for (const kind of ['image', 'audio'] as const) {
        const item = result[kind];
        if (!item) continue;
        const registered = this.get(item.assetId, kind);
        this.read(item.assetId, kind, registered.sha256);
        item.sha256 = registered.sha256;
      }
      return result;
    } catch {
      throw new BadRequestException(
        'Quiz media must reference an available registered asset',
      );
    }
  }

  assertReady(value: unknown): void {
    try {
      const media = parseMedia(value, true);
      for (const kind of ['image', 'audio'] as const) {
        const item = media?.[kind];
        if (item) this.read(item.assetId, kind, item.sha256);
      }
    } catch {
      throw new BadRequestException(
        'Quiz media must reference an available registered asset',
      );
    }
  }
}

const registry = new QuizMediaRegistry();

export function getRegisteredQuizAsset(
  assetId: string,
  kind: QuizMediaKind,
): QuizMediaAsset {
  return registry.get(assetId, kind);
}

export function readQuizMediaAsset(
  assetId: string,
  kind: QuizMediaKind,
  sha256: string,
): QuizMediaBytes {
  return registry.read(assetId, kind, sha256);
}

export function normalizeQuizMedia(input: unknown): StoredQuizMedia | null {
  return registry.normalize(input);
}

export function assertQuizMediaReady(value: unknown): void {
  registry.assertReady(value);
}
