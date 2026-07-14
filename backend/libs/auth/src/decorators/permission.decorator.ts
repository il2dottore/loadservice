import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'auth:permissions';

export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_METADATA_KEY, permissions);
