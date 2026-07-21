import { Module } from '@nestjs/common';
import { FeatureModule } from './feature/feature.module';
import { PlanModule } from './plan/plan.module';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { NewsModule } from './news/news.module';
import { TicketModule } from './ticket/ticket.module';
import { ConfigModule } from '@app/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { AuthLibModule } from '@app/auth';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';

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
