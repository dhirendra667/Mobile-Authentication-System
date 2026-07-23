const { User } = require('../models/index');

// Every column except the encrypted face_embedding — used as the default
// attribute set so the ciphertext never accidentally rides along in a
// response payload (e.g. via successResponse(message, user) in a
// controller). Only getUserByMobileWithFaceEmbedding below opts back in,
// and only face_auth_service.js should ever call that one.
const DEFAULT_ATTRIBUTES = { exclude: ['face_embedding'] };

// UserRepository handles all direct DB operations for the Users table
class UserRepository {

    // Find user by primary key
    async getUserById(id) {
        return User.findByPk(id, { attributes: DEFAULT_ATTRIBUTES });
    }

    // Find user by mobile number — used for login and duplicate checks
    async getUserByMobile(mobile) {
        return User.findOne({ where: { mobile }, attributes: DEFAULT_ATTRIBUTES });
    }

    // Same lookup, but WITH the encrypted embedding included — only ever
    // used inside FaceAuthService.verifyFace, right before decrypting and
    // comparing. Never pass this result straight into successResponse().
    async getUserByMobileWithFaceEmbedding(mobile) {
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

    // Registers/updates or clears face auth for a user.
    // Pass encryptedEmbedding = null to disable (see FaceAuthService.disableFace).
    async updateFaceAuth(id, faceAuthEnabled, encryptedEmbedding) {
        const [updatedCount, updatedRows] = await User.update(
            {
                face_auth_enabled: faceAuthEnabled,
                face_embedding: encryptedEmbedding,
                face_embedding_updated_at: encryptedEmbedding ? new Date() : null,
            },
            { where: { id }, returning: true }
        );
        if (updatedCount === 0) return null;

        // Re-fetch through the default (embedding-excluded) attribute set
        // rather than trusting `returning: true`'s row shape, so the
        // service layer only ever holds a clean User back to the caller.
        return this.getUserById(id);
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



// const { User } = require('../models/index');

// // UserRepository handles all direct DB operations for the Users table
// class UserRepository {

//     // Find user by primary key
//     async getUserById(id) {
//         return User.findByPk(id);
//     }

//     // Find user by mobile number — used for login and duplicate checks
//     async getUserByMobile(mobile) {
//         return User.findOne({ where: { mobile } });
//     }

//     // Create a new user row
//     async createUser(data) {
//         return User.create(data);
//     }

//     // Update biometric settings for a user
//     async updateBiometric(id, biometric_enabled, biometric_type) {
//         const [updatedCount, updatedRows] = await User.update(
//             { biometric_enabled, biometric_type },
//             { where: { id }, returning: true }
//         );
//         if (updatedCount === 0) return null;
//         return updatedRows[0];
//     }

//     // Update any user fields by id
//     async updateUser(id, data) {
//         const [updatedCount, updatedRows] = await User.update(data, {
//             where: { id },
//             returning: true,
//         });
//         if (updatedCount === 0) return null;
//         return updatedRows[0];
//     }

//     // Delete a user by id — returns number of deleted rows
//     async deleteUser(id) {
//         return User.destroy({ where: { id } });
//     }
// }

// module.exports = UserRepository;
