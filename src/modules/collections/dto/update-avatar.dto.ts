import { AvatarStyle } from '@prisma/client';
import { IsEnum, IsIn, ValidateIf } from 'class-validator';
import { AVATAR_ITEM_CATALOG, AvatarItemId } from '../collections.catalog';

export class UpdateAvatarDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(AVATAR_ITEM_CATALOG.map((item) => item.id))
  itemId?: AvatarItemId;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(AvatarStyle)
  style?: AvatarStyle;
}
