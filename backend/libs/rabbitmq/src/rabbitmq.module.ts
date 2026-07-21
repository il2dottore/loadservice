// This is producer, and the different one at attack/main.ts is consumer,
// they're totally not the same.
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class RabbitmqModule {
  static forServices(
    queues: Array<{ name: symbol; configKey: string }>,
  ): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        ConfigModule,
        ClientsModule.registerAsync(
          queues.map(({ name, configKey }) => ({
            name,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [config.getOrThrow<string>('rabbitmq.url')],
                queue: config.getOrThrow<string>(configKey),
                queueOptions: { durable: true },
                persistent: true,
              },
            }),
          })),
        ),
      ],
      exports: [ClientsModule],
    };
  }
}
