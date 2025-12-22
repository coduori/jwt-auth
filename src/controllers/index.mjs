import { Router } from 'express';

import authenticationController from '../controllers/authentication.mjs';
import { requestLogger } from '../middleware/request-logger.mjs';

const router = new Router();

router.use(requestLogger);
router.use('/auth', authenticationController);

router.get('/health', async (req, res) => {
    try {
        const healthStatus = { data: 'Alive and kicking!' };
        res.status(200).send({ healthStatus });
    } catch (error) {
        res.status(error.status || 500).send({ message: error.message || 'Server side error!' });
    }
});

export default router;
