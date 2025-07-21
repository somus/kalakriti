import { drizzleZeroConfig } from 'drizzle-zero';

import * as drizzleSchema from './schema';

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema);
