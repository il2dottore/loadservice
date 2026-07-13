import { Module } from '@nestjs/common';
import { FeatureModule } from './apps/gateways/admin/feature/src/feature.module';
import { MethodModule } from './apps/gateways/admin/method/src/method.module';
import { NetworkModule } from './apps/gateways/admin/network/src/network.module';
import { PermissionModule } from './apps/gateways/admin/permission/src/permission.module';
import { PlanModule } from './apps/gateways/admin/plan/src/plan.module';
import { RoleModule } from './apps/gateways/admin/role/src/role.module';
import { ServerModule } from './apps/gateways/admin/server/src/server.module';
import { AttackModule } from './apps/gateways/attack/src/attack.module';
import { UserModule } from './apps/gateways/user/src/user.module';
import { PostgresDatabaseModule } from './libs/database/src/postgresql/postgresql.module';
import { AuthModule } from './apps/gateways/auth/src/auth.module';
import { NewsModule } from './apps/gateways/news/src/news.module';
import { TicketModule } from './apps/gateways/ticket/src/ticket.module';
import { ConfigModule } from './libs/config/src/config.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule,
    PostgresDatabaseModule,
    UserModule,
    AuthModule,
    FeatureModule,
    MethodModule,
    NetworkModule,
    PermissionModule,
    PlanModule,
    RoleModule,
    ServerModule,
    AttackModule,
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
