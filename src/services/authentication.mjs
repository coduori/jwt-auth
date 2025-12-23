import { setKey } from '../db/redis.mjs';
import { create, findForAuth, findUserBy } from '../models/user.model.mjs';
import { hashPassword, signToken, verifyPassword } from '../utils/index.mjs';

const registerUser = async ({ email, password, role }) => {
    try {
        const response = await create({
            email,
            passwordHash: await hashPassword(password),
            role,
        });
        if (!response.success) {
            return response;
        }
    } catch (error) {
        return error;
    }
    return findUserBy('email', email);
};

const authenticateUser = async ({ email, password }) => {
    const user = await findForAuth('email', email);
    if (!user) {
        return { success: false, message: 'invalid credentials' };
    }
    if (user) {
        const verifiedPassword = await verifyPassword(password, user.passwordHash);
        if (!verifiedPassword) {
            return { success: false, message: 'invalid credentials' };
        }
        const token = signToken({ id: user.id, email, role: user.role });
        return { success: true, token, ttl: process.env.JWT_EXPIRES_IN };
    }
};

const logoutUser = async ({ jti, exp }) => {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
        await setKey(`blacklisted:token:${jti}`, '1', {
            expiration: { type: 'EX', value: Number(ttl) },
        });
    }
};

export { authenticateUser, logoutUser, registerUser };
