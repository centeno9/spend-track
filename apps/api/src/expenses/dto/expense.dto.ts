import { Expose, Transform, Type } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';

export class ExpenseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  userId: string;

  totalCents: number;

  @Expose()
  expensedAt: Date;

  @Expose()
  title: string;

  @Expose()
  description: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => Number((obj.totalCents ?? 0) / 100))
  total: number;
}
