import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AttackService } from './attack.service';
import { AttackStatus } from './dtos/update-attack.dto';
import { Channel, Message } from 'amqplib';

@Controller()
export class AttackStatusController {
  constructor(private readonly attackService: AttackService) {}

  @EventPattern('attack.updateStatus')
  async update(
    @Payload()
    payload: {
      id: number;
      status: AttackStatus;
      failureReason?: string;
      slotKey?: string;
      serverId?: number;
    },
    @Ctx() context: RmqContext,
  ) {
    const result = await this.attackService.updateStatus(
      payload.id,
      payload.status,
      payload.failureReason,
      payload.slotKey,
      payload.serverId,
    );
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    channel.ack(message);
    return result;
  }
}
