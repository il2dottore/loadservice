import { SetMetadata } from '@nestjs/common';

export const ROLE_METADATA_KEY = 'auth:roles';

export const Role = (...roles: string[]) =>
  SetMetadata(ROLE_METADATA_KEY, roles);
