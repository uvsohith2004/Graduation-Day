import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';

export const InjectDB = () => Inject(DATABASE_CONNECTION);
