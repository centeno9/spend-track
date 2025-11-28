import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesPaginationQueryDto } from './dto/expenses-pagination-query.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserRequest } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto, req.user.id);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserRequest,
    @Query() query: ExpensesPaginationQueryDto,
  ) {
    return this.expensesService.findAll(currentUser.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
