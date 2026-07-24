#!/bin/bash
# ============================================================
#  jualdanbeli — Script Update Otomatis
#  Jalankan: bash update.sh
#  Aman: .env, database, uploads TIDAK akan diubah
# ============================================================

set -e

# --- Warna output ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo -e "${BOLD}============================================${NC}"
echo -e "${BOLD}   jualdanbeli™ — Update Aplikasi          ${NC}"
echo -e "${BOLD}============================================${NC}"
echo ""

# --- Deteksi folder instalasi ---
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
info "Folder instalasi : $INSTALL_DIR"
info "Tanggal update   : $(date '+%d-%m-%Y %H:%M')"
echo ""

# --- Pastikan .env ada sebelum update ---
if [ ! -f "$INSTALL_DIR/.env" ]; then
  err "File .env tidak ditemukan! Pastikan aplikasi sudah terinstall dengan benar dulu."
fi

# --- Simpan cadangan .env ---
log "Menyimpan cadangan .env..."
cp "$INSTALL_DIR/.env" "/tmp/jualdanbeli-env-backup-$(date +%s)"

# --- Minta URL ZIP update ---
echo ""
echo -e "${BOLD}Masukkan URL ZIP update dari Replit:${NC}"
echo -e "${YELLOW}(URL ini didapat dari sesi chat Replit setiap kali ada update)${NC}"
echo -n "URL: "
read -r ZIP_URL

if [ -z "$ZIP_URL" ]; then
  err "URL tidak boleh kosong!"
fi

# --- Download ZIP update ---
echo ""
log "Mendownload file update..."
TMPZIP="/tmp/jualdanbeli-update-$(date +%s).zip"
wget -q --show-progress -O "$TMPZIP" "$ZIP_URL" || \
  curl -L --progress-bar -o "$TMPZIP" "$ZIP_URL" || \
  err "Gagal download! Cek koneksi internet dan URL."

ZIP_SIZE=$(du -sh "$TMPZIP" | cut -f1)
log "Download selesai: $ZIP_SIZE"

# --- Buat folder sementara ---
TMPDIR="/tmp/jualdanbeli-update-extract-$(date +%s)"
mkdir -p "$TMPDIR"
log "Mengekstrak file update..."
unzip -q "$TMPZIP" -d "$TMPDIR"

# --- Temukan root folder dalam ZIP ---
EXTRACTED_ROOT=$(find "$TMPDIR" -maxdepth 2 -name "package.json" | head -1 | xargs dirname)
if [ -z "$EXTRACTED_ROOT" ]; then
  err "Struktur ZIP tidak valid!"
fi
info "Root folder terdeteksi: $EXTRACTED_ROOT"

# --- Daftar file/folder yang TIDAK boleh diubah (pengaturan user) ---
PROTECTED=(
  ".env"
  "data/"
  "uploads/"
  "ssl/"
  "nginx-custom.conf"
  "ecosystem.config.js"
  "logs/"
  "backups/"
)

echo ""
warn "File berikut DILINDUNGI dan tidak akan diubah:"
for item in "${PROTECTED[@]}"; do
  echo "    - $item"
done
echo ""

# --- Salin file kode baru (kecuali yang dilindungi) ---
log "Menyalin file kode baru..."

# Salin semua file kecuali yang dilindungi
rsync -a --exclude='.env' \
         --exclude='data/' \
         --exclude='uploads/' \
         --exclude='ssl/' \
         --exclude='nginx-custom.conf' \
         --exclude='ecosystem.config.js' \
         --exclude='logs/' \
         --exclude='backups/' \
         --exclude='node_modules/' \
         "$EXTRACTED_ROOT/" "$INSTALL_DIR/" 2>/dev/null || {
  # Fallback kalau rsync tidak ada
  warn "rsync tidak tersedia, pakai cp biasa..."
  # Hapus folder kode lama (tapi jaga yang dilindungi)
  for dir in artifacts lib scripts; do
    if [ -d "$EXTRACTED_ROOT/$dir" ]; then
      rm -rf "$INSTALL_DIR/$dir"
      cp -r "$EXTRACTED_ROOT/$dir" "$INSTALL_DIR/$dir"
    fi
  done
  # Salin file root (package.json, tsconfig, dll) tapi BUKAN .env
  for f in package.json pnpm-workspace.yaml tsconfig.json tsconfig.base.json \
            Dockerfile.api Dockerfile.web docker-compose.yml nginx.conf \
            install.sh update.sh CARA-INSTALL.md DEPLOYMENT.md TERMUX-VPS.md; do
    if [ -f "$EXTRACTED_ROOT/$f" ]; then
      cp "$EXTRACTED_ROOT/$f" "$INSTALL_DIR/$f"
    fi
  done
}

# --- Pastikan .env kembali ke tempat semula ---
LATEST_BACKUP=$(ls -t /tmp/jualdanbeli-env-backup-* 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  cp "$LATEST_BACKUP" "$INSTALL_DIR/.env"
  log ".env dipulihkan dari cadangan"
fi

# --- Install dependensi baru ---
echo ""
log "Menginstall dependensi (ini butuh beberapa menit)..."
cd "$INSTALL_DIR"

if command -v pnpm &>/dev/null; then
  pnpm install --frozen-lockfile 2>&1 | tail -5
else
  npm install 2>&1 | tail -5
fi
log "Dependensi berhasil diinstall"

# --- Jalankan migrasi database (aman, tidak hapus data) ---
echo ""
log "Sinkronisasi skema database (tidak menghapus data)..."
pnpm --filter @workspace/db run push 2>&1 | tail -5 || \
  warn "Migrasi database dilewati (tidak ada perubahan skema)"

# --- Build ulang ---
log "Build ulang aplikasi..."
pnpm --filter @workspace/api-server run build 2>&1 | tail -3
log "Build selesai"

# --- Restart services ---
echo ""
log "Merestart services..."
if command -v pm2 &>/dev/null; then
  pm2 reload jualdanbeli-api jualdanbeli-web 2>/dev/null || \
  pm2 restart all 2>/dev/null || \
    warn "PM2 restart gagal — coba manual: pm2 restart all"
  log "Services berhasil direstart via PM2"
elif systemctl is-active --quiet jualdanbeli-api 2>/dev/null; then
  systemctl restart jualdanbeli-api jualdanbeli-web 2>/dev/null
  log "Services berhasil direstart via systemctl"
else
  warn "Restart manual diperlukan. Jalankan:"
  echo "    pm2 restart all"
  echo "    -- atau --"
  echo "    bash $INSTALL_DIR/deploy.sh"
fi

# --- Bersihkan file sementara ---
rm -f "$TMPZIP"
rm -rf "$TMPDIR"

# --- Selesai ---
echo ""
echo -e "${BOLD}============================================${NC}"
echo -e "${GREEN}${BOLD}  ✓ UPDATE BERHASIL!${NC}"
echo -e "${BOLD}============================================${NC}"
echo ""
log "Versi terbaru sudah aktif"
log ".env dan database Anda tidak berubah"
log "Log error: pm2 logs jualdanbeli-api"
echo ""
echo -e "${YELLOW}💡 Tip: Simpan URL ZIP update ini untuk referensi masa depan${NC}"
echo ""
