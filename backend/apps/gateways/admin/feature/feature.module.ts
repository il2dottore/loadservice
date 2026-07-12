import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../../../libs/database/src/postgresql/postgresql.module';
import { FeatureController } from './feature.controller';
import { FeatureRepository } from './feature.repository';
import { FeatureService } from './services/feature.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService]
})
export class FeatureModule { }
