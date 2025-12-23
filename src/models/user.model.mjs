import { AppDataSource } from '../db/postgres.mjs';
import User from '../entities/user.entity.mjs';
import { BaseModel } from './base.model.mjs';

const userRepository = AppDataSource.getRepository(User);

const UserModel = new BaseModel(userRepository);

const create = async (userData) => UserModel.create(userData);

const findUserBy = async (parameter, value) => UserModel.findByFields({ [parameter]: value });

const findForAuth = async (parameter, value) =>
    UserModel.query('users')
        .addSelect('users.passwordHash')
        .where(`users.${parameter} = :value `, { value })
        .getOne();

const update = async (userId, userDetails) => UserModel.update({ id: userId }, userDetails);

export { create, findForAuth, findUserBy, update };
