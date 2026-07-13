import { Module } from '@nestjs/common';
import { FeatureModule } from './feature/src/feature.module';
import { PermissionModule } from './auth/src/permission/permission.module';
import { PlanModule } from './plan/src/plan.module';
import { RoleModule } from './auth/src/role/role.module';
import { UserModule } from './auth/src/user/user.module';
import { PostgresDatabaseModule } from '../../libs/database/src/postgresql/postgresql.module';
import { AuthModule } from './auth/src/auth.module';
import { NewsModule } from './news/src/news.module';
import { TicketModule } from './ticket/src/ticket.module';
import { ConfigModule } from '../../libs/config/src/config.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule,
    PostgresDatabaseModule.forService('darkservice'),
    UserModule,
    AuthModule,
    FeatureModule,
    PermissionModule,
    PlanModule,
    RoleModule,
    NewsModule,
    TicketModule
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule { }
