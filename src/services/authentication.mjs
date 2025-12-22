import { setKey } from '../db/redis.mjs';
import { create, findUserBy } from '../models/user.model.mjs';
import { hashPassword, signToken, verifyPassword } from '../utils/index.mjs';

const registerUser = async ({ email, password, role }) => {
    await create({
        email,
        passwordHash: await hashPassword(password),
        role,
    });
    const createduser = await findUserBy('email', email);
    return createduser;
};

const authenticateUser = async ({ email, password }) => {
    const user = await findUserBy('email', email);
    if (user) {
        const verifiedPassword = await verifyPassword(password, user.password);
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
