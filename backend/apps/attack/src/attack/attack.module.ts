import { Module } from '@nestjs/common';
import { AttackController } from './attack.controller';
import { AttackRepository } from './attack.repository';
import { AttackService } from './attack.service';

@Module({
  imports: [],
  controllers: [AttackController],
  providers: [AttackService, AttackRepository],
  exports: [AttackService]
})
export class AttackModule { }
