import { Module } from '@nestjs/common';
import { AttackController } from './attack.controller';
import { AttackRepository } from './attack.repository';
import { AttackService } from './attack.service';
import { RabbitmqModule } from '@app/rabbitmq';
import { RABBITMQ_ATTACK_QUEUE, RABBITMQ_ATTACK_STATUS_QUEUE } from '@app/rabbitmq';
import { MethodModule } from '../method/method.module';
import { ServerModule } from '../server/server.module';
import { RedisModule } from '@app/redis/redis.module';
import { AttackStatusController } from './attack-status.controller';
import { AttackGateway } from './attack.gateway';

@Module({
  imports: [
    MethodModule,
    ServerModule,
    RedisModule,
    RabbitmqModule.forServices([
      { name: RABBITMQ_ATTACK_QUEUE, configKey: 'rabbitmq.attackQueue' },
      { name: RABBITMQ_ATTACK_STATUS_QUEUE, configKey: 'rabbitmq.attackStatusQueue' },
    ]),
  ],
  controllers: [AttackController, AttackStatusController],
  providers: [AttackService, AttackRepository, AttackGateway],
  exports: [AttackService]
})
export class AttackModule { }
