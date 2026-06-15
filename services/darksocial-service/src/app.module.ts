import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';

@Module({
  imports: [PostgresDatabaseModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
