import { Module } from '@nestjs/common';
import { AttackController } from './attack.controller';
import { AttackRepository } from './attack.repository';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { AttackService } from './attack.service';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [AttackController],
  providers: [AttackService, AttackRepository],
  exports: [AttackService]
})
export class AttackModule { }
