import crypto from "node:crypto";

const iterations = 120000;
const keyLength = 32;
const digest = "sha256";

export const passwordService = {
  hashPassword(password: string): { passwordHash: string; passwordSalt: string } {
    const passwordSalt = crypto.randomBytes(16).toString("base64url");
    const passwordHash = crypto
      .pbkdf2Sync(password, passwordSalt, iterations, keyLength, digest)
      .toString("base64url");
    return { passwordHash, passwordSalt };
  },

  verifyPassword(password: string, passwordHash: string, passwordSalt: string): boolean {
    const nextHash = crypto
      .pbkdf2Sync(password, passwordSalt, iterations, keyLength, digest)
      .toString("base64url");
    return crypto.timingSafeEqual(Buffer.from(nextHash), Buffer.from(passwordHash));
  },
};
