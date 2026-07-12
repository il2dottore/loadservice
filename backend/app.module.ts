import { Module } from '@nestjs/common';
import { FeatureModule } from './apps/gateways/admin/feature/feature.module';
import { MethodModule } from './apps/gateways/admin/method/method.module';
import { NetworkModule } from './apps/gateways/admin/network/network.module';
import { PermissionModule } from './apps/gateways/admin/permission/permission.module';
import { PlanModule } from './apps/gateways/admin/plan/plan.module';
import { RoleModule } from './apps/gateways/admin/role/role.module';
import { ServerModule } from './apps/gateways/admin/server/server.module';
import { AttackModule } from './apps/gateways/attack/attack.module';
import { UserModule } from './apps/gateways/user/user.module';
import { PostgresDatabaseModule } from './libs/database/src/postgresql/postgresql.module';
import { AuthModule } from './apps/gateways/auth/src/auth.module';
import { NewsModule } from './apps/gateways/news/news.module';
import { TicketModule } from './apps/gateways/ticket/ticket.module';

@Module({
  imports: [
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
  providers: [],
})
export class AppModule { }
