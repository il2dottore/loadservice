import { Module } from '@nestjs/common';
import { AttackController } from './attack/attack.controller';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { AttackRepository } from './attack/attack.repository';
import { AttackService } from './attack/attack.service';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [AttackController],
  providers: [AttackService, AttackRepository],
  exports: [AttackService]
})
export class AttackModule { }
