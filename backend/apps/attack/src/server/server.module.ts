import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { ServerRepository } from './server.repository';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  exports: [ServerService]
})
export class ServerModule { }
