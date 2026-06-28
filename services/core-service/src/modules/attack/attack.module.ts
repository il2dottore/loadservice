import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { AttackController } from './attack.controller';
import { AttackRepository } from './attack.repository';
import { AttackService } from './services/attack.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [AttackController],
  providers: [AttackService, AttackRepository],
  exports: [AttackService]
})
export class AttackModule {}
