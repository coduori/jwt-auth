import 'reflect-metadata';

import http from 'node:http';

import dotenv from 'dotenv';
import express from 'express';

import { initDatabase } from './db/postgres.mjs';
import { connect, disconnect } from './db/redis.mjs';
import setupHttpServer from './http-server.mjs';
import { ERROR_START, isEntryPoint } from './utils/index.mjs';
import { logger } from './utils/logger.mjs';

let server;
const app = express();

dotenv.config();

app.start = async () => {
    await connect();
    await initDatabase();

    const port = process.env.PORT;
    server = http.createServer(app);

    logger.info('Setting up http...');
    await setupHttpServer({
        app,
        port,
        server,
    });

    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        logger.info(`Failed to start server: ${error}`);
        process.exit(ERROR_START);
    });

    server.on('listening', async () => {
        const address = server.address();
        logger.info(`Server listening ${address.address}:${address.port};`);
        logger.info('Ready to GO!\n\n');
    });

    process.on('uncaughtException', (error) => {
        logger.info(error);
    });

    process.on('unhandledRejection', (error) => {
        logger.info(error);
    });

    logger.info('Starting server...');
    server.listen(port);
};

app.stop = () =>
    new Promise((resolve, reject) => {
        logger.info('Stopping server...');
        server.close(async (err) => {
            try {
                if (err) {
                    reject(err);
                    return;
                }
                await disconnect();
                logger.info('Bye Bye!');
                resolve(true);
            } catch (ex) {
                reject(ex);
            }
        });
    });

if (isEntryPoint(import.meta.url)) {
    try {
        await app.start();

        logger.info('...dmvic setup complete!');
    } catch (err) {
        logger.info(err);
        process.exit(ERROR_START);
    }
}

export default app;
