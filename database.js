import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("app.sqlite3");

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    k TEXT PRIMARY KEY,
    v BLOB NOT NULL
  );
`);

// --- Encryption / Decryption helpers ---
function encrypt(value, key) {
  const iv = crypto.randomBytes(12); // GCM nonce
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Store: iv + tag + ciphertext
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(data, key) {
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext, null, "utf8") + decipher.final("utf8");
}

export function tokenStore(key) {
  if (key || key.length !== 32) {
    throw new Error("Encryption key must be 32 bytes for AES-256");
  }

  const setStmt = db.prepare(`
    INSERT OR REPLACE INTO refresh_tokens (k, v)
    VALUES (?, ?)
  `);

  const getStmt = db.prepare(`
    SELECT v FROM refresh_tokens WHERE k = ?
  `);

  const delStmt = db.prepare(`
    DELETE FROM refresh_tokens WHERE k = ?
  `);

  return {
    set(k, v) {
      const enc = encrypt(v, key);
      setStmt.run(k, enc);
    },

    get(k) {
      const row = getStmt.get(k);
      if (!row) return null;

      try {
        return decrypt(row.v, key);
      } catch {
        return null;
      }
    },

    delete(k) {
      delStmt.run(k);
    }
  };
}

//export default db