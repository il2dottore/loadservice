import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../../libs/database/src/postgresql/postgresql.module';
import { ConfigModule } from '../../../libs/config/src/config.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { MethodModule } from './method/method.module';
import { NetworkModule } from './network/network.module';
import { ServerModule } from './server/server.module';
import { AttackModule } from './attack/attack.module';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    AttackModule,
    MethodModule,
    NetworkModule,
    ServerModule,
    ConfigModule,
    AuthLibModule,
    PostgresDatabaseModule.forService('attack'),
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
