import {
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'total must be a number with up to 2 decimal places' },
  )
  @IsPositive()
  total: number;

  @Type(() => Date)
  @IsDate()
  expensedAt: Date;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];
}
