import { QueryFailedError } from 'typeorm';

import { logger } from '../utils/logger.mjs';

class BaseModel {
    constructor(repository) {
        this.repo = repository;
    }

    async create(data) {
        try {
            const entity = this.repo.create(data);
            const saved = await this.repo.save(entity);
            return { success: true, data: saved };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async findByFields(fields) {
        try {
            const entity = await this.repo.findOneBy(fields);
            if (!entity)
                return { success: false, message: 'Entity not found', code: 'ENTITY_NOT_FOUND' };
            return { success: true, data: entity };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async update(id, updates) {
        try {
            const entity = await this.repo.findOneBy({ id });
            if (!entity)
                return { success: false, message: 'Entity not found', code: 'ENTITY_NOT_FOUND' };

            this.repo.merge(entity, updates);
            const updated = await this.repo.save(entity);
            return { success: true, data: updated };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async delete(id) {
        try {
            const entity = await this.repo.findOneBy({ id });
            if (!entity)
                return { success: false, message: 'Entity not found', code: 'ENTITY_NOT_FOUND' };

            await this.repo.remove(entity);
            return { success: true, message: 'Entity deleted successfully' };
        } catch (error) {
            return this.handleError(error);
        }
    }

    query(alias) {
        try {
            return this.repo.createQueryBuilder(alias);
        } catch (error) {
            return this.handleError(error);
        }
    }

    handleError(error) {
        if (error instanceof QueryFailedError) {
            const code = error.driverError?.code;
            switch (code) {
                case '23505':
                    return {
                        success: false,
                        message: 'Duplicate key error',
                        code: 'DUPLICATE_KEY',
                        details: process.env.NODE_ENV !== 'production' && error.message,
                    };
                case '23503':
                    return {
                        success: false,
                        message: 'Foreign key constraint violation',
                        code: 'FK_CONSTRAINT',
                        details: process.env.NODE_ENV !== 'production' && error.message,
                    };
                case '23502':
                    return {
                        success: false,
                        message: 'Not null violation',
                        code: 'NOT_NULL_VIOLATION',
                        details: process.env.NODE_ENV !== 'production' && error.message,
                    };
                default:
                    return {
                        success: false,
                        message: 'Database query failed',
                        code: 'DB_QUERY_FAILED',
                        details: process.env.NODE_ENV !== 'production' && error.message,
                    };
            }
        }
        logger.error(error);
        return {
            success: false,
            message: 'Unexpected error',
            code: 'UNEXPECTED_ERROR',
            details: process.env.NODE_ENV !== 'production' && error.message,
        };
    }
}

export { BaseModel };
