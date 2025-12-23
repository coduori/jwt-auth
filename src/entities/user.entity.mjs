import { EntitySchema } from 'typeorm';

import { userRoles } from '../utils/entity-enums.mjs';

export default new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
            default: () => 'gen_random_uuid()',
        },
        email: {
            type: 'varchar',
            length: 255,
            nullable: true,
            unique: true,
        },
        username: {
            type: 'varchar',
            length: 255,
            nullable: true,
            unique: true,
        },
        role: {
            type: 'enum',
            enum: Object.values(userRoles),
            default: userRoles.POLICY_HOLDER,
        },
        passwordHash: {
            type: 'varchar',
            select: false,
            length: 255,
            nullable: false,
            name: 'password_hash',
        },
        createdAt: {
            type: 'timestamptz',
            createDate: true,
            default: () => 'CURRENT_TIMESTAMP',
        },
        updatedAt: {
            type: 'timestamptz',
            updateDate: true,
            default: () => 'CURRENT_TIMESTAMP',
        },
    },
    checks: [
        {
            name: 'CHK_USER_EMAIL_VALID',
            expression: `
          email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$'
        `,
        },
    ],
    indices: [
        {
            name: 'IDX_NOT_NULL_USER_EMAIL',
            columns: ['email'],
            where: 'email IS NOT NULL',
        },
        {
            name: 'IDX_NOT_NULL_USERNAME',
            columns: ['username'],
            where: 'username IS NOT NULL',
        },
        {
            name: 'IDX_USER_EMAIL',
            columns: ['email'],
        },
        {
            name: 'IDX_USERNAME',
            columns: ['username'],
        },
    ],
});
