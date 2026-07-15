import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { ServerRepository } from './server.repository';

@Module({
  imports: [],
  controllers: [ServerController],
  providers: [ServerService, ServerRepository],
  exports: [ServerService, ServerRepository]
})
export class ServerModule { }
