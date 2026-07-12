import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './src/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from './src/guards/resource-owner.guard';
import { RolesGuard } from './src/guards/roles.guard';
import { JwtStrategy } from './src/strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiresIn') as any,
        },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, ResourceOwnerGuard, RolesGuard],
  exports: [JwtModule, PassportModule, JwtAuthGuard, ResourceOwnerGuard, RolesGuard],
})
export class AuthLibModule { }
