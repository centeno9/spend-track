import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { fromDecimalToCents } from './utils/transform.utils';
import { ExpenseDto } from './dto/expense.dto';
import { getPaginationData, mapToDto } from 'src/common/utils/transform.utils';
import { Expense } from 'generated/prisma';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { ExpensesPaginationQueryDto } from './dto/expenses-pagination-query.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const {
      title,
      expensedAt,
      total,
      tagIds = [],
      description = null,
    } = createExpenseDto;

    const totalCents = fromDecimalToCents(total);

    const newExpense = await this.prisma.expense.create({
      data: {
        title,
        expensedAt,
        totalCents,
        description,
        userId,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    return this.findOne(newExpense.id);
  }

  async findAll(userId: string, queryDto: ExpensesPaginationQueryDto) {
    const {
      limit = 100,
      page = 1,
      startDate,
      endDate,
      includeSummary = false,
    } = queryDto;

    const skip = page === 1 ? 0 : limit * (page - 1);

    const whereCondition = {
      userId,
      ...(startDate || endDate
        ? {
            expensedAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [expenses, count, summaryArg] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
        include: {
          tags: { include: { tag: true } },
        },
        orderBy: {
          expensedAt: 'asc',
        },
      }),
      this.prisma.expense.count({ where: whereCondition }),
      includeSummary
        ? this.prisma.expense.aggregate({
            where: whereCondition,
            _sum: { totalCents: true },
          })
        : this.prisma.expense.aggregate({
            where: whereCondition,
            _sum: { totalCents: true },
            take: 0,
          }),
    ]);

    return {
      data: expenses.map((exp) => this.toDto(exp)),
      pagination: getPaginationData(page, limit, count),
      ...(includeSummary && {
        summary: {
          rangeTotal: (summaryArg._sum.totalCents ?? 0) / 100,
        },
      }),
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: id },
      include: { user: true, tags: { include: { tag: true } } },
    });

    if (!expense)
      throw new NotFoundException(`expense with the provided id not found`);

    return this.toDto(expense);
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const { total, ...data } = updateExpenseDto;

    const updateExpense = await this.prisma.expense.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(total && { totalCents: fromDecimalToCents(total) }),
      },
    });

    return this.toDto(updateExpense);
  }

  async remove(id: string) {
    await this.prisma.expense.delete({ where: { id } });
    return;
  }

  private toDto(expense: Expense) {
    return mapToDto(ExpenseDto, expense, { excludeExtraneousValues: true });
  }
}
