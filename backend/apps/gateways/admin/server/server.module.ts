import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerRepository } from './server.repository';
import { ServerService } from './services/server.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  exports: [ServerService]
})
export class ServerModule { }
