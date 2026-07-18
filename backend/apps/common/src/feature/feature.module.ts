import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureRepository } from './feature.repository';
import { FeatureService } from './services/feature.service';

@Module({
  imports: [],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService]
})
export class FeatureModule { }
