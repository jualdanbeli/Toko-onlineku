/**
 * Seed admin account — dijalankan otomatis setelah migrate.
 * Aman dijalankan berulang kali (idempotent).
 */
import pg from "pg";
import crypto from "crypto";

const { Client } = pg;

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "jualdanbeli_salt_2024").digest("hex");
}

const ADMIN_EMAIL    = "radjapamungkas007@gmail.com";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME     = "Hari Muhammad Hamzah";
const ADMIN_PHONE    = "081297785448";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL tidak ditemukan");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const passwordHash = hashPassword(ADMIN_PASSWORD);

    // Buat atau update akun admin
    const result = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role, status, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'admin', 'active', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
         SET role          = 'admin',
             status        = 'active',
             is_verified   = true,
             password_hash = EXCLUDED.password_hash,
             updated_at    = NOW()
       RETURNING id, email, role`,
      [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, passwordHash]
    );

    const admin = result.rows[0];
    console.log(`✅ Admin OK — id=${admin.id} email=${admin.email} role=${admin.role}`);

    // Pastikan wallet admin ada
    await client.query(
      `INSERT INTO wallets (user_id, balance, pending_balance)
       VALUES ($1, '0', '0')
       ON CONFLICT (user_id) DO NOTHING`,
      [admin.id]
    );

    console.log("✅ Wallet admin OK");
    console.log("");
    console.log("===========================================");
    console.log("  Login Admin:");
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
    console.log("===========================================");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("❌ Seed gagal:", err.message);
  process.exit(1);
});
