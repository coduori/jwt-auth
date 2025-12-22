import { configDotenv } from 'dotenv';
import { DataSource } from 'typeorm';

import User from '../entities/user.entity.mjs';
import { logger } from '../utils/logger.mjs';

configDotenv();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    logging: true,
    entities: [User],
    ssl: false,
});

async function initDatabase() {
    try {
        await AppDataSource.initialize();
    } catch (err) {
        logger.error('Error during Data Source initialization', err);
        throw new Error(`Error connecting to persistent db: ${err.code || err}`);
    }
}

export { AppDataSource, initDatabase };
