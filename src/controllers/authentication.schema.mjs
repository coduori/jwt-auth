import { object, string } from 'yup';

import { userRoles } from '../utils/entity-enums.mjs';

const createUserSchema = object({
    email: string()
        .trim()
        .email()
        .when('role', {
            is: (role) => role !== userRoles.POLICY_HOLDER,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    username: string()
        .trim()
        .when('role', {
            is: userRoles.POLICY_HOLDER,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    password: string().min(8).max(255).required(),
    role: string().oneOf(Object.values(userRoles)).optional(),
})
    .noUnknown(true, 'Unknown field provided')
    .strict(true);

const loginSchema = object({
    email: string()
        .trim()
        .email()
        .when('role', {
            is: (role) => role !== userRoles.POLICY_HOLDER,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    username: string()
        .trim()
        .when('role', {
            is: userRoles.POLICY_HOLDER,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    password: string().required(),
})
    .noUnknown(true, 'Unknown field provided')
    .strict(true);

export { createUserSchema, loginSchema };
