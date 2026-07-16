import { Module } from '@nestjs/common';
import { FeatureModule } from './src/feature/src/feature.module';
import { PermissionModule } from './src/auth/src/permission/permission.module';
import { PlanModule } from './src/plan/src/plan.module';
import { RoleModule } from './src/auth/src/role/role.module';
import { UserModule } from './src/auth/src/user/user.module';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { AuthModule } from './src/auth/src/auth/auth.module';
import { NewsModule } from './src/news/src/news.module';
import { TicketModule } from './src/ticket/src/ticket.module';
import { ConfigModule } from '@app/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule,
    PostgresDatabaseModule.forService('core'),
    AuthLibModule,
    UserModule,
    AuthModule,
    FeatureModule,
    PermissionModule,
    PlanModule,
    RoleModule,
    NewsModule,
    TicketModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
