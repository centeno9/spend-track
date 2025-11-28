import { User } from 'generated/prisma';

export type UserWithoutPass = Omit<User, 'password'>;
