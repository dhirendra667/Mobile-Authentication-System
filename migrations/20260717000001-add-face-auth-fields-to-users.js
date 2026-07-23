'use strict';

// Adds camera-based Face Authentication support alongside the existing
// on-device biometric_enabled/biometric_type columns.
//
// IMPORTANT DESIGN NOTE (read this before touching face_embedding):
// The original schema comment on biometric_type says "we never store
// biometric images / actual verification happens on-device". That design
// still holds for fingerprint/Face ID (BiometricPrompt) — nothing changes
// there. Camera-based face recognition is different: the match has to
// happen somewhere, and doing it purely on-device (with no server-side
// record) means anyone who roots/reinstalls the app can never re-verify
// against "the same face" from a fresh install. So for this feature we
// store a FACE EMBEDDING (a ~128-512 float vector representation of the
// face, produced by an ML model) — never the raw photo, never a
// reversible image. The embedding itself is encrypted at rest (see
// src/utils/face_crypto.js) with AES-256-GCM before it ever touches the
// database. This column should never appear in an API response — see
// UserRepository.getUserById / getUserByMobile, which explicitly select
// away from it in the default query.
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'face_auth_enabled', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Ciphertext only (iv + authTag + encrypted payload, base64-encoded
        // as one string by face_crypto.js). Nullable — not every user
        // registers a face.
        await queryInterface.addColumn('Users', 'face_embedding', {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        // Lets us invalidate/expire old embeddings later (e.g. force
        // re-registration after N months) without a separate table.
        await queryInterface.addColumn('Users', 'face_embedding_updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Users', 'face_embedding_updated_at');
        await queryInterface.removeColumn('Users', 'face_embedding');
        await queryInterface.removeColumn('Users', 'face_auth_enabled');
    },
};
