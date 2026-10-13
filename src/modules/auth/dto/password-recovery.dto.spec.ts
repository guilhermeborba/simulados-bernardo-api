import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ForgotPasswordDto, ResetPasswordDto } from './password-recovery.dto';
import { RegisterDto } from './register.dto';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const token = 'A'.repeat(43);
const reset = (value: unknown) =>
  pipe.transform(value, { type: 'body', metatype: ResetPasswordDto });

describe('Password recovery strict DTO boundary', () => {
  it.each([
    'abcdefgh',
    'a'.repeat(72),
    'é'.repeat(36),
    '界'.repeat(24),
    '😀'.repeat(18),
    'é'.repeat(24),
  ])(
    'accepts a password within the 72 UTF-8 byte bcrypt boundary: %p',
    async (password) => {
      await expect(reset({ token, password })).resolves.toMatchObject({
        password,
      });
    },
  );
  it.each([
    'a'.repeat(73),
    'é'.repeat(37),
    '界'.repeat(25),
    '😀'.repeat(19),
    'é'.repeat(25),
    '1234567',
    '',
    null,
    12345678,
    ['abcdefgh'],
  ])('rejects invalid or truncated password material: %p', async (password) => {
    await expect(reset({ token, password })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it.each([
    undefined,
    null,
    42,
    'A'.repeat(42),
    'A'.repeat(44),
    `${'A'.repeat(42)}+`,
    `${'A'.repeat(42)}/`,
    `${'A'.repeat(42)}=`,
    ` ${'A'.repeat(42)}`,
  ])('rejects invalid reset token forms: %p', async (value) => {
    await expect(
      reset({ token: value, password: 'abcdefgh' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it.each([
    { token, password: 'abcdefgh', userId: 'other-account' },
    { token, password: 'abcdefgh', authVersion: 0 },
    { token, password: 'abcdefgh', email: 'other@example.test' },
  ])(
    'rejects attempts to choose a reset target or session version: %p',
    async (body) => {
      await expect(reset(body)).rejects.toBeInstanceOf(BadRequestException);
    },
  );
  it('uses the same byte boundary during new account registration', async () => {
    await expect(
      pipe.transform(
        {
          name: 'Aluno',
          email: 'account@example.test',
          password: '😀'.repeat(19),
        },
        { type: 'body', metatype: RegisterDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('accepts only a valid email and refuses arbitrary recipient/link fields on forgot', async () => {
    await expect(
      pipe.transform(
        { email: 'account@example.test' },
        { type: 'body', metatype: ForgotPasswordDto },
      ),
    ).resolves.toMatchObject({ email: 'account@example.test' });
    await expect(
      pipe.transform(
        { email: 'invalid-address' },
        { type: 'body', metatype: ForgotPasswordDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      pipe.transform(
        {
          email: 'account@example.test',
          redirectTo: 'https://external.example',
        },
        { type: 'body', metatype: ForgotPasswordDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
