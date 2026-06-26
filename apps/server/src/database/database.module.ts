import { Global, Module, Provider } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { db } from './db';

const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useValue: db,
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}
