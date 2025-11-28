import { Expose, Transform, Type } from 'class-transformer';
import { Prisma } from 'generated/prisma';
import { mapToDto } from 'src/common/utils/transform.utils';
import { TagDto } from 'src/tags/dto/tag.dto';
import { UserDto } from 'src/users/dto/user.dto';

type ExpenseWithTags = Prisma.ExpenseGetPayload<{
  include: { tags: { include: { tag: true } } };
}>;

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

  @Expose()
  @Transform(({ obj }: { obj: Partial<ExpenseWithTags> }) =>
    (obj.tags ?? []).map((et) =>
      mapToDto(TagDto, et.tag, { excludeExtraneousValues: true }),
    ),
  )
  tags: TagDto[];
}
