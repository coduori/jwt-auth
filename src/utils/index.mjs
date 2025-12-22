import { randomUUID } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ERROR_START = 15;

function stripExt(name) {
    const extension = path.extname(name);
    if (!extension) {
        return name;
    }

    return name.slice(0, -extension.length);
}

function isEntryPoint(url) {
    const modulePath = fileURLToPath(url);
    const scriptPath = process.argv[1];
    const extension = path.extname(scriptPath);

    if (extension) {
        return modulePath === scriptPath;
    }

    return stripExt(modulePath) === scriptPath;
}

const hashPassword = (pwd) => bcrypt.hash(pwd, 12);
const verifyPassword = (pwd, hash) => bcrypt.compare(pwd, hash);

const signToken = (payload) =>
    jwt.sign({ ...payload, jti: randomUUID() }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export {
    ERROR_START,
    hashPassword,
    isEntryPoint,
    signToken,
    stripExt,
    verifyPassword,
    verifyToken,
};
