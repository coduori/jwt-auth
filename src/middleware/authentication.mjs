import { getKey } from '../db/redis.mjs';
import { extractBearerToken } from '../utils/extract-bearer-token.mjs';
import { verifyToken } from '../utils/index.mjs';

export const authenticate = async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) return res.sendStatus(401);

    try {
        const decodedToken = verifyToken(token);
        const blacklisted = await getKey(`blacklisted:token:${decodedToken.jti}`);
        if (blacklisted) {
            return res.status(401).json({ success: false, messge: 'invalid credentials!' });
        }

        req.user = decodedToken;
        next();
    } catch {
        res.status(401).json({ success: false, messge: 'invalid credentials!' });
    }
};
