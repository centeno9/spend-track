import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { TagsModule } from './tags/tags.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    ExpensesModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
