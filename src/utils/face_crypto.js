const crypto = require('crypto');

const { FACE_EMBEDDING_ENCRYPTION_KEY, FACE_EMBEDDING_DIMENSIONS } = require('../config/server_config');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit IV is the recommended size for GCM

// Lazily validated (not at require-time) so the app doesn't crash on boot
// just because .env isn't fully filled in yet during local setup — it only
// throws the moment someone actually tries to register/verify a face.
function getKeyBuffer() {
    if (!FACE_EMBEDDING_ENCRYPTION_KEY || FACE_EMBEDDING_ENCRYPTION_KEY.length !== 64) {
        throw new Error(
            'FACE_EMBEDDING_ENCRYPTION_KEY is missing or not a 64-char hex string. ' +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return Buffer.from(FACE_EMBEDDING_ENCRYPTION_KEY, 'hex');
}

// Encrypts a face embedding (array of floats) into a single opaque string
// safe to store in the face_embedding TEXT column.
// Layout: base64(iv) . base64(authTag) . base64(ciphertext), joined by '.'
function encryptEmbedding(embeddingArray) {
    const key = getKeyBuffer();
    const iv = crypto.randomBytes(IV_LENGTH_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintext = Buffer.from(JSON.stringify(embeddingArray), 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join('.');
}

// Reverses encryptEmbedding — throws if the ciphertext was tampered with or
// the key doesn't match (GCM auth tag verification fails).
function decryptEmbedding(ciphertextString) {
    const key = getKeyBuffer();
    const [ivB64, authTagB64, dataB64] = ciphertextString.split('.');

    if (!ivB64 || !authTagB64 || !dataB64) {
        throw new Error('Malformed encrypted embedding payload');
    }

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
}

// Basic shape validation for an incoming embedding before it's ever
// encrypted or compared — rejects garbage/malformed payloads early.
function isValidEmbedding(embedding) {
    if (!Array.isArray(embedding)) return false;
    if (embedding.length !== FACE_EMBEDDING_DIMENSIONS) return false;
    return embedding.every((value) => typeof value === 'number' && Number.isFinite(value));
}

// Cosine similarity between two equal-length numeric vectors.
// Returns a value in [-1, 1] — 1 means identical direction (same face),
// values near 0 or negative mean unrelated/different faces.
function cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Cannot compare embeddings of different lengths');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i += 1) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

module.exports = {
    encryptEmbedding,
    decryptEmbedding,
    isValidEmbedding,
    cosineSimilarity,
};
