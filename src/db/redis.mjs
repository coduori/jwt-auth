import redis from 'redis';

import { logger } from '../utils/logger.mjs';

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
});

async function connect() {
    logger.info('Connecting to cache db...');
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Error connecting to cache db:', error);
        throw new Error(`Error connecting to cache db: ${error.code}`);
    }
    logger.info('...Connected to cache db!');
}

async function setKey(
    key,
    value,
    options = {
        expiration: { type: 'EX', value: 604800 },
    }
) {
    logger.info(`Setting key ${key} in cache db...`);
    try {
        await redisClient.set(key, value, options);
    } catch (error) {
        throw new Error(`Error setting key ${key} in cache db: ${error.message}`);
    }
    logger.info(`...Set key ${key} in cache db!`);
}

async function getKey(key) {
    logger.info(`Getting key ${key} from cache db...`);
    try {
        const value = await redisClient.get(key);
        if (value === null) {
            logger.info(`Key ${key} not found in cache db!`);
            return null;
        }
        logger.info(`...Got key ${key} from cache db!`);
        return value;
    } catch (error) {
        throw new Error(`Error getting key ${key} from cache db: ${error.message}`);
    }
}

async function disconnect() {
    logger.info('Disconnecting from cache db ...');
    try {
        await redisClient.quit();
    } catch (error) {
        logger.error('Error disconnecting from cache db:', error);
    }
    logger.info('...Disconnected from cache db!');
}

export { connect, disconnect, getKey, setKey };
