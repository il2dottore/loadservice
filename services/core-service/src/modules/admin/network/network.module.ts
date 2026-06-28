import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { NetworkController } from './network.controller';
import { NetworkRepository } from './network.repository';
import { NetworkService } from './services/network.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [NetworkController],
  providers: [NetworkService, NetworkRepository],
  exports: [NetworkService]
})
export class NetworkModule {}
