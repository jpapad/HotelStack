import type { UserRole } from '@prisma/client';

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};
