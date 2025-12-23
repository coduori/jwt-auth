import { setKey } from '../db/redis.mjs';
import { create, findForAuth, findUserBy } from '../models/user.model.mjs';
import { hashPassword, signToken, verifyPassword } from '../utils/index.mjs';

const registerUser = async ({ email, password, username, role }) => {
    try {
        const response = await create({
            email,
            username,
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

const authenticateUser = async ({ email, username, password }) => {
    const userCredential = email || username;
    const user = await findForAuth(userCredential);
    if (!user) {
        return { success: false, message: 'invalid credentials' };
    }
    if (user) {
        const verifiedPassword = await verifyPassword(password, user.passwordHash);
        if (!verifiedPassword) {
            return { success: false, message: 'invalid credentials' };
        }
        const token = signToken({ id: user.id, userCredential, role: user.role });
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
