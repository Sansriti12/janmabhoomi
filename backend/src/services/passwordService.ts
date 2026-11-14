import crypto from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

/**
 * Hashes a plaintext password using native crypto.scrypt with a secure random salt.
 * Formats output as an OWASP/PHC-compatible string:
 * $scrypt$N=16384,r=8,p=1$<salt_hex>$<derived_key_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LEN);
    crypto.scrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, derivedKey) => {
        if (err) return reject(err);
        const saltHex = salt.toString("hex");
        const keyHex = derivedKey.toString("hex");
        resolve(`$scrypt$N=${SCRYPT_N},r=${SCRYPT_R},p=${SCRYPT_P}$${saltHex}$${keyHex}`);
      }
    );
  });
}

/**
 * Verifies a plaintext password against a stored PHC scrypt hash.
 * Uses crypto.timingSafeEqual to prevent side-channel timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split("$");
  // Expected parts: ["", "scrypt", "N=16384,r=8,p=1", saltHex, keyHex]
  if (parts.length < 5 || parts[1] !== "scrypt") {
    return false;
  }

  const saltHex = parts[3];
  const expectedKeyHex = parts[4];
  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(expectedKeyHex, "hex");

  return new Promise((resolve) => {
    crypto.scrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, derivedKey) => {
        if (err || derivedKey.length !== expectedKey.length) {
          return resolve(false);
        }
        try {
          const isMatch = crypto.timingSafeEqual(derivedKey, expectedKey);
          resolve(isMatch);
        } catch {
          resolve(false);
        }
      }
    );
  });
}
