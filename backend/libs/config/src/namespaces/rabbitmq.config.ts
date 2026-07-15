import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL ?? 'amqp://sussybaka:sussybakadeptrai@localhost:5672',
  attackQueue: process.env.RABBITMQ_ATTACK_QUEUE ?? 'attack.events',
  attackStatusQueue: process.env.RABBITMQ_ATTACK_STATUS_QUEUE ?? 'attack.status.events',
}));
