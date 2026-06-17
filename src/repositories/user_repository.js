const { User } = require('../models/index');

// UserRepository handles all direct DB operations for the Users table
class UserRepository {

    // Find user by primary key
    async getUserById(id) {
        return User.findByPk(id);
    }

    // Find user by mobile number — used for login and duplicate checks
    async getUserByMobile(mobile) {
        return User.findOne({ where: { mobile } });
    }

    // Create a new user row
    async createUser(data) {
        return User.create(data);
    }

    // Update biometric settings for a user
    async updateBiometric(id, biometric_enabled, biometric_type) {
        const [updatedCount, updatedRows] = await User.update(
            { biometric_enabled, biometric_type },
            { where: { id }, returning: true }
        );
        if (updatedCount === 0) return null;
        return updatedRows[0];
    }

    // Update any user fields by id
    async updateUser(id, data) {
        const [updatedCount, updatedRows] = await User.update(data, {
            where: { id },
            returning: true,
        });
        if (updatedCount === 0) return null;
        return updatedRows[0];
    }

    // Delete a user by id — returns number of deleted rows
    async deleteUser(id) {
        return User.destroy({ where: { id } });
    }
}

module.exports = UserRepository;
