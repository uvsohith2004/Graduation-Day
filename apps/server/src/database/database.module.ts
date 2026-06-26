import { Module, Global } from '@nestjs/common';
import { createPool, createDatabase } from '@repo/db';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: (configService: ConfigService) => {
        return createPool({
          connectionString: configService.getDatabaseUrl(),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'DATABASE',
      useFactory: (pool: ReturnType<typeof createPool>) => createDatabase(pool),
      inject: ['DATABASE_POOL'],
    },
  ],
  exports: ['DATABASE_POOL', 'DATABASE'],
})
export class DatabaseModule { }
