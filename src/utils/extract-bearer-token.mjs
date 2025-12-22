const extractBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    return token;
};

export { extractBearerToken };
