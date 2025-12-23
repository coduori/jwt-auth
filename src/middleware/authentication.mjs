import { getKey } from '../db/redis.mjs';
import { userRoles } from '../utils/entity-enums.mjs';
import { extractBearerToken } from '../utils/extract-bearer-token.mjs';
import { verifyToken } from '../utils/index.mjs';

const authenticate = async (req, res, next) => {
    const token = extractBearerToken(req);
    if (!token) return res.status(401).json({ success: false, messge: 'invalid credentials!' });

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

const authorizeAdmin = async (req, res, next) => {
    if (!req.user)
        return res.status(403).json({ success: false, messge: 'Admin access required!' });
    const { role } = req.user;
    if (![userRoles.ADMIN].includes(role)) {
        return res.status(403).json({ success: false, messge: 'Admin access required!' });
    }
    next();
};

export { authenticate, authorizeAdmin };
