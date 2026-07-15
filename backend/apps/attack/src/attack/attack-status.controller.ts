import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AttackService } from './attack.service';
import { AttackStatus } from './dtos/update-attack.dto';

@Controller()
export class AttackStatusController {
  constructor(private readonly attackService: AttackService) {}

  @EventPattern('attack.updateStatus')
  async update(@Payload() payload: { id: number; status: AttackStatus; failureReason?: string; slotKey?: string }, @Ctx() context: RmqContext) {
    const result = await this.attackService.updateStatus(payload.id, payload.status, payload.failureReason, payload.slotKey);
    context.getChannelRef().ack(context.getMessage());
    return result;
  }
}
