import {
  registerDecorator,
  ValidationOptions,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export function MaxPasswordBytes(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'maxPasswordBytes',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72,
        defaultMessage: () => 'password must be at most 72 UTF-8 bytes',
      },
    });
}
export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @MaxPasswordBytes()
  password!: string;
}
