import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

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
          expiresIn: config.getOrThrow<string>(
            'jwt.accessExpiresIn',
          ) as unknown as Required<JwtModuleOptions>['signOptions']['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    ResourceOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    ResourceOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthLibModule {}
