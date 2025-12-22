import { AppDataSource } from '../db/postgres.mjs';
import User from '../entities/user.entity.mjs';

const userRepository = AppDataSource.getRepository(User);

const create = async (userData) => {
    try {
        const newUser = userRepository.create(userData);
        return await userRepository.save(newUser);
    } catch (err) {
        throw new Error(err);
    }
};

const find = async (userId) => {
    try {
        return await userRepository.findOne({ where: { id: userId } });
    } catch (err) {
        throw new Error(err);
    }
};

const findUserBy = async (parameter, value) => {
    try {
        return await userRepository.find({ where: { [parameter]: value } });
    } catch (err) {
        throw new Error(err);
    }
};

const update = async (userId, userDetails) => {
    try {
        return await userRepository.update({ id: userId }, userDetails);
    } catch (err) {
        throw new Error(err);
    }
};

export { create, find, findUserBy, update };
