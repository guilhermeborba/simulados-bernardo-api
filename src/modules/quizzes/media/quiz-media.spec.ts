import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QuizQuestionDto } from '../dto/create-quiz.dto';
import {
  parseStoredQuizMedia,
  QuizMediaAsset,
  QuizMediaRegistry,
} from './quiz-media';

const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="20" fill="blue"/><title>Um círculo azul.</title></svg>',
);

function wav(): Buffer {
  const bytes = Buffer.alloc(48);
  bytes.write('RIFF');
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16000, 24);
  bytes.writeUInt32LE(32000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(4, 40);
  return bytes;
}

function manifestAsset(
  id: string,
  kind: 'image' | 'audio',
  bytes: Buffer,
): QuizMediaAsset {
  return {
    id,
    kind,
    file: `${id}.${kind === 'image' ? 'svg' : 'wav'}`,
    mimeType: kind === 'image' ? 'image/svg+xml' : 'audio/wav',
    sha256: createHash('sha256').update(bytes).digest('hex'),
    byteLength: bytes.length,
  };
}

const imageAsset = manifestAsset('shape-image', 'image', svg);
const audioAsset = manifestAsset('shape-audio', 'audio', wav());
const input = {
  image: { assetId: imageAsset.id, alt: 'Um círculo azul.' },
  audio: { assetId: audioAsset.id, transcript: 'Observe o círculo azul.' },
};
const stored = {
  image: { ...input.image, sha256: imageAsset.sha256 },
  audio: { ...input.audio, sha256: audioAsset.sha256 },
};

let assetsDirectory: string;
let registry: QuizMediaRegistry;

beforeEach(() => {
  assetsDirectory = mkdtempSync(join(tmpdir(), 'quiz-media-registry-'));
  registry = new QuizMediaRegistry(assetsDirectory);
  writeFileSync(join(assetsDirectory, imageAsset.file), svg);
  writeFileSync(join(assetsDirectory, audioAsset.file), wav());
  writeFileSync(
    join(assetsDirectory, 'manifest.json'),
    JSON.stringify([imageAsset, audioAsset]),
  );
});

afterEach(() => rmSync(assetsDirectory, { recursive: true, force: true }));

describe('Packaged quiz media registry', () => {
  it('pins registered bytes and trims accessibility text without accepting client hashes', () => {
    expect(
      registry.normalize({
        image: { ...input.image, alt: '  Um círculo azul.  ' },
        audio: input.audio,
      }),
    ).toEqual(stored);
    expect(registry.read(imageAsset.id, 'image', imageAsset.sha256)).toEqual({
      bytes: svg,
      mimeType: 'image/svg+xml',
      byteLength: svg.length,
    });
    expect(
      registry.read(audioAsset.id, 'audio', audioAsset.sha256).bytes,
    ).toEqual(wav());
  });

  it('accepts optional media and individual modalities', () => {
    expect(registry.normalize(undefined)).toBeNull();
    expect(registry.normalize(null)).toBeNull();
    expect(registry.normalize({ image: input.image })).toEqual({
      image: stored.image,
    });
    expect(registry.normalize({ audio: input.audio })).toEqual({
      audio: stored.audio,
    });
    expect(() => registry.assertReady(null)).not.toThrow();
    expect(() => registry.assertReady(stored)).not.toThrow();
  });

  it.each([
    ['unknown URL', { url: 'https://example.test/asset.svg' }],
    [
      'nested URL',
      { image: { ...input.image, url: 'https://example.test/asset.svg' } },
    ],
    ['filesystem path', { image: { assetId: '../../private', alt: 'Imagem' } }],
    ['absolute path', { image: { assetId: '/etc/passwd', alt: 'Imagem' } }],
    [
      'external asset identifier',
      { image: { assetId: 'https://example.test/a', alt: 'Imagem' } },
    ],
    ['unknown asset', { image: { assetId: 'unknown', alt: 'Imagem' } }],
    ['wrong modality', { image: { assetId: audioAsset.id, alt: 'Imagem' } }],
    ['client-provided hash', { image: stored.image }],
    ['blank alt', { image: { ...input.image, alt: '   ' } }],
    ['missing alt', { image: { assetId: imageAsset.id } }],
    ['blank transcript', { audio: { ...input.audio, transcript: '' } }],
    ['missing transcript', { audio: { assetId: audioAsset.id } }],
    [
      'nested private metadata',
      { image: { ...input.image, correctAnswer: 'A' } },
    ],
    ['empty media', {}],
    ['array media', []],
    ['null image', { image: null }],
  ])('rejects %s', (_, value) => {
    expect(() => registry.normalize(value)).toThrow(BadRequestException);
  });

  it('keeps snapshot metadata readable when files and manifest disappear', () => {
    rmSync(assetsDirectory, { recursive: true, force: true });
    expect(parseStoredQuizMedia(stored)).toEqual(stored);
    expect(() =>
      registry.read(imageAsset.id, 'image', imageAsset.sha256),
    ).toThrow(NotFoundException);
    expect(() => registry.assertReady(stored)).toThrow(BadRequestException);
  });

  it('rejects changed bytes rather than silently replacing a pinned asset', () => {
    writeFileSync(
      join(assetsDirectory, imageAsset.file),
      svg.toString().replace('blue', 'pink'),
    );
    expect(() =>
      registry.read(imageAsset.id, 'image', imageAsset.sha256),
    ).toThrow(NotFoundException);
    expect(() => registry.normalize(input)).toThrow(BadRequestException);
  });

  it('rejects changed registry hashes for an existing snapshot', () => {
    const changed = Buffer.from(svg.toString().replace('blue', 'pink'));
    const replacement = manifestAsset(imageAsset.id, 'image', changed);
    writeFileSync(join(assetsDirectory, imageAsset.file), changed);
    writeFileSync(
      join(assetsDirectory, 'manifest.json'),
      JSON.stringify([replacement, audioAsset]),
    );
    expect(() =>
      registry.read(imageAsset.id, 'image', imageAsset.sha256),
    ).toThrow(NotFoundException);
    expect(parseStoredQuizMedia(stored)).toEqual(stored);
  });

  it('rejects filesystem symlinks even when the manifest hash matches their target', () => {
    rmSync(join(assetsDirectory, imageAsset.file));
    writeFileSync(join(assetsDirectory, 'external.svg'), svg);
    symlinkSync(
      join(assetsDirectory, 'external.svg'),
      join(assetsDirectory, imageAsset.file),
    );
    expect(() =>
      registry.read(imageAsset.id, 'image', imageAsset.sha256),
    ).toThrow(NotFoundException);
  });

  it.each([
    ['traversal path', { file: '../outside.svg' }],
    ['absolute path', { file: '/tmp/outside.svg' }],
    ['unbounded size', { byteLength: 2 * 1024 * 1024 + 1 }],
    ['wrong content type', { mimeType: 'text/html' }],
    ['wrong extension', { file: 'shape-image.wav' }],
    ['invalid digest', { sha256: 'invalid' }],
    ['unexpected private field', { correctAnswer: 'A' }],
  ])('rejects manifest %s', (_, patch) => {
    writeFileSync(
      join(assetsDirectory, 'manifest.json'),
      JSON.stringify([{ ...imageAsset, ...patch }]),
    );
    expect(() => registry.get(imageAsset.id, 'image')).toThrow(
      BadRequestException,
    );
  });

  it('rejects duplicate asset identities and zero or incorrect byte lengths', () => {
    writeFileSync(
      join(assetsDirectory, 'manifest.json'),
      JSON.stringify([imageAsset, imageAsset]),
    );
    expect(() => registry.get(imageAsset.id, 'image')).toThrow(
      BadRequestException,
    );
    writeFileSync(
      join(assetsDirectory, 'manifest.json'),
      JSON.stringify([{ ...imageAsset, byteLength: svg.length - 1 }]),
    );
    expect(() =>
      registry.read(imageAsset.id, 'image', imageAsset.sha256),
    ).toThrow(NotFoundException);
  });

  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><rect onload="alert(1)"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject>HTML</foreignObject></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.test/x"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:url(https://example.test/x)"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="&#117;&#114;&#108;(x)"/></svg>',
    '<!DOCTYPE svg [<!ENTITY file SYSTEM "file:///etc/passwd">]><svg></svg>',
  ])(
    'rejects SVG capable of execution, embedding or external retrieval',
    (source) => {
      const bytes = Buffer.from(source);
      const asset = manifestAsset(imageAsset.id, 'image', bytes);
      writeFileSync(join(assetsDirectory, asset.file), bytes);
      writeFileSync(
        join(assetsDirectory, 'manifest.json'),
        JSON.stringify([asset]),
      );
      expect(() => registry.read(asset.id, 'image', asset.sha256)).toThrow(
        NotFoundException,
      );
    },
  );

  it('rejects a registered WAV with invalid PCM structure even when its hash matches', () => {
    const bytes = wav();
    bytes.writeUInt16LE(3, 20);
    const asset = manifestAsset(audioAsset.id, 'audio', bytes);
    writeFileSync(join(assetsDirectory, asset.file), bytes);
    writeFileSync(
      join(assetsDirectory, 'manifest.json'),
      JSON.stringify([asset]),
    );
    expect(() => registry.read(asset.id, 'audio', asset.sha256)).toThrow(
      NotFoundException,
    );
  });
});

describe('Stored quiz media metadata', () => {
  it.each([
    { image: input.image },
    { image: { ...stored.image, sha256: 'invalid' } },
    { image: { ...stored.image, correctAnswer: 'A' } },
    { image: { ...stored.image, assetId: '../private' } },
    { image: { ...stored.image, alt: '' } },
    { audio: { ...stored.audio, transcript: [] } },
    { image: { ...stored.image, url: 'https://example.test/private' } },
    { image: stored.image, explanation: 'Private' },
  ])('fails closed for corrupt or unexpected stored metadata', (value) => {
    expect(() => parseStoredQuizMedia(value)).toThrow(
      InternalServerErrorException,
    );
  });
});

describe('Quiz media nested DTO', () => {
  const validation = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const question = {
    originKey: 'shape-q1',
    statement: 'Que forma é esta?',
    explanation: 'A forma é circular.',
    points: 1,
    options: [
      { optionKey: 'A', text: 'Círculo' },
      { optionKey: 'B', text: 'Quadrado' },
    ],
    correctAnswer: 'A',
  };

  it('accepts and trims nested accessibility fields', async () => {
    const dto = (await validation.transform(
      { ...question, media: { image: { ...input.image, alt: '  Imagem  ' } } },
      { type: 'body', metatype: QuizQuestionDto },
    )) as QuizQuestionDto;
    expect(dto.media?.image?.alt).toBe('Imagem');
    expect(registry.normalize(dto.media)?.image?.alt).toBe('Imagem');
  });

  it.each([
    { image: { ...input.image, url: 'https://example.test/x' } },
    { image: { ...input.image, sha256: imageAsset.sha256 } },
    { image: { assetId: '../x', alt: 'Imagem' } },
    { image: { ...input.image, alt: '   ' } },
    { audio: { ...input.audio, transcript: 42 } },
    { audio: { ...input.audio, transcript: ' ', private: true } },
    { image: [] },
    { image: input.image, correctAnswer: 'A' },
  ])(
    'rejects nested unsafe, missing or unexpected media fields',
    async (media) => {
      await expect(
        validation.transform(
          { ...question, media },
          { type: 'body', metatype: QuizQuestionDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );
});
