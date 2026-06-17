const NotFoundError = require('../errors/not_found_error');
const BadRequestError = require('../errors/bad_request_error');
const InternalServerError = require('../errors/internal_server_error');

class UserService {

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Get a user by id — throws NotFoundError if not found
    async getUserById(id) {
        try {
            const user = await this.userRepository.getUserById(id);
            if (!user) throw new NotFoundError('User', 'id', id);
            return user;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('UserService: getUserById', error);
            throw new InternalServerError();
        }
    }

    // Update user profile fields
    async updateUser(id, data) {
        try {
            const updated = await this.userRepository.updateUser(id, data);
            if (!updated) throw new NotFoundError('User', 'id', id);
            return updated;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            if (error.name === 'SequelizeValidationError') {
                const reason = error.errors.map((e) => e.message);
                throw new BadRequestError(error.errors[0].path, true, reason);
            }
            console.log('UserService: updateUser', error);
            throw new InternalServerError();
        }
    }

    // Enable or disable biometric authentication for a user
    async updateBiometric(id, biometric_enabled, biometric_type) {
        try {
            const updated = await this.userRepository.updateBiometric(id, biometric_enabled, biometric_type);
            if (!updated) throw new NotFoundError('User', 'id', id);
            return updated;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('UserService: updateBiometric', error);
            throw new InternalServerError();
        }
    }

    // Delete a user account
    async deleteUser(id) {
        try {
            const deleted = await this.userRepository.deleteUser(id);
            if (!deleted) throw new NotFoundError('User', 'id', id);
            return deleted;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('UserService: deleteUser', error);
            throw new InternalServerError();
        }
    }
}

module.exports = UserService;
