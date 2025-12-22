import { Router } from 'express';
import { ValidationError } from 'yup';

import { authenticate } from '../middleware/authentication.mjs';
import { authenticateUser, logoutUser, registerUser } from '../services/authentication.mjs';
import { createUserSchema, loginSchema } from './authentication.schema.mjs';

const router = new Router();

router.post('/register', async (req, res) => {
    try {
        createUserSchema.validateSync(req.body, { abortEarly: false });
        const response = await registerUser(req.body);
        res.status(201).json({ ...response });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        loginSchema.validateSync(req.body, { abortEarly: false });
        const response = await authenticateUser(req.body);
        if (response.success) {
            res.status(200);
        } else {
            res.status(400);
        }
        res.json({ ...response });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post('/logout', authenticate, async (req, res) => {
    try {
        await logoutUser(req.user);
        res.status(204).json({ success: true, message: 'logout successful!' });
    } catch (error) {
        res.status(401).json({ success: false, error });
    }
});

export default router;
