import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../../../libs/database/src/postgresql/postgresql.module';
import { ServerController } from './server.controller';
import { ServerRepository } from './server.repository';
import { ServerService } from './services/server.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  exports: [ServerService]
})
export class ServerModule { }
