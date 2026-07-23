const { generateJWT } = require('../utils/auth');
const { encryptEmbedding, decryptEmbedding, cosineSimilarity } = require('../utils/face_crypto');
const { FACE_MATCH_THRESHOLD } = require('../config/server_config');

const BadRequestError = require('../errors/bad_request_error');
const NotFoundError = require('../errors/not_found_error');
const UnauthorizedError = require('../errors/unauthorized_error');
const InternalServerError = require('../errors/internal_server_error');

// FaceAuthService owns everything to do with camera-based face
// registration and login. Kept separate from AuthService's
// biometricLogin (device BiometricPrompt) — that path never touches the
// database beyond a boolean flag; this one has to actually compare
// embeddings, so it deserves its own service rather than bolting more
// branches onto AuthService.
class FaceAuthService {

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Called right after a normal OTP login/signup, from the authenticated
    // Settings/BiometricSetup flow. Overwrites any previously registered
    // embedding for this user (re-registering is how a user "updates"
    // their face, e.g. after registering under bad lighting).
    async registerFace(userId, embeddingArray) {
        try {
            const encrypted = encryptEmbedding(embeddingArray);
            const user = await this.userRepository.updateFaceAuth(userId, true, encrypted);

            if (!user) {
                throw new NotFoundError('User', 'id', userId);
            }

            return user;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('FaceAuthService: registerFace', error);
            throw new InternalServerError();
        }
    }

    // Turns face auth off and — deliberately — deletes the stored
    // embedding rather than just flipping face_auth_enabled to false.
    // A disabled-but-still-stored embedding is a liability with no
    // upside; if the user re-enables later they just register again.
    async disableFace(userId) {
        try {
            const user = await this.userRepository.updateFaceAuth(userId, false, null);

            if (!user) {
                throw new NotFoundError('User', 'id', userId);
            }

            return user;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;
            console.log('FaceAuthService: disableFace', error);
            throw new InternalServerError();
        }
    }

    // Camera-based login: the app already ran on-device liveness checks
    // (blink detection etc, see mobile app's faceAuthService.ts) before
    // ever getting here — this call only decides "does this embedding
    // match the one we have on file for this mobile number".
    async verifyFace(mobile, embeddingArray) {
        try {
            const user = await this.userRepository.getUserByMobileWithFaceEmbedding(mobile);

            if (!user) {
                throw new NotFoundError('User', 'mobile', mobile);
            }

            if (!user.face_auth_enabled || !user.face_embedding) {
                throw new UnauthorizedError('Face authentication is not enabled for this account.');
            }

            const storedEmbedding = decryptEmbedding(user.face_embedding);
            const similarity = cosineSimilarity(storedEmbedding, embeddingArray);

            if (similarity < FACE_MATCH_THRESHOLD) {
                // Intentionally vague — don't leak the similarity score or
                // threshold to the client, that just helps an attacker tune
                // a spoof attempt.
                throw new UnauthorizedError('Face did not match. Please try again or use OTP login.');
            }

            const token = generateJWT({ id: user.id, mobile: user.mobile });

            // Strip the embedding back out before handing the user object
            // up to the controller — this is the one path that fetched it.
            const { face_embedding, ...safeUser } = user.toJSON();

            return { user: safeUser, token };
        } catch (error) {
            if (
                error.name === 'NotFoundError' ||
                error.name === 'UnauthorizedError' ||
                error.name === 'BadRequestError'
            ) throw error;

            console.log('FaceAuthService: verifyFace', error);
            throw new InternalServerError();
        }
    }
}

module.exports = FaceAuthService;
