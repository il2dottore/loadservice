import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkRepository } from './network.repository';
import { NetworkService } from './services/network.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  controllers: [NetworkController],
  providers: [NetworkService, NetworkRepository],
  exports: [NetworkService]
})
export class NetworkModule { }
