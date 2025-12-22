import { logger } from '../utils/logger.mjs';

const requestLogger = (req, res, next) => {
    const { body } = req;
    logger.info(JSON.stringify(body));
    next();
};

export { requestLogger };
