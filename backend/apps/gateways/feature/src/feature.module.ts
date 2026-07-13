import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureRepository } from './feature.repository';
import { FeatureService } from './services/feature.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService()
  ],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService]
})
export class FeatureModule { }
