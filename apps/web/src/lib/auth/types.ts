export type UserRole = 'RECEPTION' | 'MANAGER' | 'HOUSEKEEPING';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
