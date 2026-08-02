#!/bin/bash
# ================================================================
#  fix-admin-vps.sh — Reset / buat ulang akun admin di VPS
#  Jalankan di folder instalasi: bash fix-admin-vps.sh
# ================================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BLUE='\033[0;34m'; NC='\033[0m'

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  jualdanbeli — Fix Akun Admin VPS${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Cari container database yang sedang jalan
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "db|postgres" | grep -i "jualdanbeli\|jualdan" | head -1)
if [ -z "$DB_CONTAINER" ]; then
  DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "db\|postgres" | head -1)
fi

if [ -z "$DB_CONTAINER" ]; then
  echo -e "${RED}❌ Container database tidak ditemukan. Pastikan aplikasi sudah running.${NC}"
  echo -e "${YELLOW}   Coba: docker compose up -d${NC}"
  exit 1
fi

echo -e "📦 Container database: ${CYAN}$DB_CONTAINER${NC}"
echo ""

# Hash password Admin123! dengan salt jualdanbeli_salt_2024
PW_HASH=$(node -e "const c=require('crypto');console.log(c.createHash('sha256').update('Admin123!jualdanbeli_salt_2024').digest('hex'))" 2>/dev/null)

if [ -z "$PW_HASH" ]; then
  # Fallback jika node tidak tersedia di host
  PW_HASH="9ebcbe1b2c80bb3c89fd4a8f0e9f10e3a7be5635f93e202b4d500f2130665f33"
fi

echo "🔧 Membuat/mereset akun admin..."

docker exec -i "$DB_CONTAINER" psql -U jualdanbeli -d jualdanbeli << EOF
-- Buat atau update akun admin
INSERT INTO users (name, email, phone, password_hash, role, status, is_verified, created_at, updated_at)
VALUES (
  'Hari Muhammad Hamzah',
  'radjapamungkas007@gmail.com',
  '081297785448',
  '$PW_HASH',
  'admin',
  'active',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
  SET role          = 'admin',
      status        = 'active',
      is_verified   = true,
      password_hash = EXCLUDED.password_hash,
      updated_at    = NOW();

-- Pastikan wallet admin ada
INSERT INTO wallets (user_id, balance, pending_balance)
SELECT id, '0', '0' FROM users WHERE email = 'radjapamungkas007@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Tampilkan hasilnya
SELECT id, name, email, role, status FROM users WHERE email = 'radjapamungkas007@gmail.com';
EOF

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Akun admin berhasil dibuat/direset!${NC}"
  echo ""
  echo -e "  Email    : ${CYAN}radjapamungkas007@gmail.com${NC}"
  echo -e "  Password : ${CYAN}Admin123!${NC}"
  echo ""
  echo -e "${YELLOW}Sekarang buka browser dan coba login kembali.${NC}"
else
  echo ""
  echo -e "${RED}❌ Gagal. Coba jalankan manual:${NC}"
  echo -e "${CYAN}docker exec -it $DB_CONTAINER psql -U jualdanbeli -d jualdanbeli${NC}"
fi
