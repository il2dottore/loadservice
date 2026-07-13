import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../libs/database/src/postgresql/postgresql.module';
import { ConfigModule } from '../../libs/config/src/config.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { AttackModule } from './src/attack.module';
import { MethodModule } from './src/method/method.module';
import { NetworkModule } from './src/network/network.module';
import { ServerModule } from './src/server/server.module';

@Module({
  imports: [
    AttackModule,
    MethodModule,
    NetworkModule,
    ServerModule,
    ConfigModule,
    PostgresDatabaseModule.forService('attack-service-db')
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule { }
