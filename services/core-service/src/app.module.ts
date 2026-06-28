import { Module } from '@nestjs/common';
import { FeatureModule } from '@modules/admin/feature/feature.module';
import { MethodModule } from '@modules/admin/method/method.module';
import { NetworkModule } from '@modules/admin/network/network.module';
import { PermissionModule } from '@modules/admin/permission/permission.module';
import { PlanModule } from '@modules/admin/plan/plan.module';
import { RoleModule } from '@modules/admin/role/role.module';
import { ServerModule } from '@modules/admin/server/server.module';
import { AttackModule } from '@modules/attack/attack.module';
import { UserModule } from './modules/user/user.module';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { AuthModule } from '@modules/auth/auth.module';
import { NewsModule } from '@modules/news/news.module';
import { TicketModule } from '@modules/ticket/ticket.module';

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
export class AppModule {}
