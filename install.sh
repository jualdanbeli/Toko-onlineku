#!/bin/bash
# ================================================================
#  J&B jualdanbeli — Auto Installer untuk Ubuntu VPS
#  Jalankan dari Termux / SSH:
#    curl -fsSL https://raw.githubusercontent.com/DOMAIN/install.sh | bash
#  ATAU upload file ini ke VPS lalu: chmod +x install.sh && ./install.sh
# ================================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

banner() {
  echo ""
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${BLUE}║   J&B™ jualdanbeli — Auto Installer VPS      ║${NC}"
  echo -e "${BOLD}${BLUE}║   Pemilik: Hari Muhammad Hamzah               ║${NC}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ ERROR: $1${NC}"; exit 1; }
step() { echo -e "\n${BOLD}${BLUE}═══ $1 ═══${NC}"; }

banner

# ── Cek OS ──────────────────────────────────────────────────────
step "1/7 - Memeriksa sistem"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  info "OS: $PRETTY_NAME"
else
  warn "Tidak bisa deteksi OS, lanjut..."
fi

if [ "$EUID" -ne 0 ]; then
  warn "Tidak berjalan sebagai root. Mencoba sudo..."
  SUDO="sudo"
else
  SUDO=""
fi

# ── Update sistem ────────────────────────────────────────────────
step "2/7 - Update sistem Ubuntu"
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq curl wget unzip git nano ufw
ok "Paket dasar terinstall"

# ── Install Docker ───────────────────────────────────────────────
step "3/7 - Install Docker"
if command -v docker &> /dev/null; then
  ok "Docker sudah terinstall: $(docker --version)"
else
  info "Menginstall Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  $SUDO sh /tmp/get-docker.sh
  rm /tmp/get-docker.sh
  if [ -n "$SUDO_USER" ]; then
    $SUDO usermod -aG docker "$SUDO_USER"
    info "User $SUDO_USER ditambahkan ke grup docker"
  else
    $SUDO usermod -aG docker "$USER" 2>/dev/null || true
  fi
  ok "Docker terinstall"
fi

# Pastikan Docker Compose tersedia
if ! command -v docker compose &> /dev/null; then
  info "Menginstall Docker Compose plugin..."
  $SUDO apt-get install -y -qq docker-compose-plugin
fi
ok "Docker Compose: $(docker compose version 2>/dev/null || echo 'OK')"

# Start Docker service
$SUDO systemctl enable docker --quiet 2>/dev/null || true
$SUDO systemctl start docker 2>/dev/null || true

# ── Setup folder aplikasi ─────────────────────────────────────────
step "4/7 - Setup folder aplikasi"
APP_DIR="/opt/jualdanbeli"
$SUDO mkdir -p "$APP_DIR"
$SUDO chown -R "$USER:$USER" "$APP_DIR" 2>/dev/null || $SUDO chmod -R 777 "$APP_DIR"
cd "$APP_DIR"
info "Folder: $APP_DIR"

# ── Download aplikasi ────────────────────────────────────────────
step "5/7 - Download aplikasi jualdanbeli"

# Cek apakah file ZIP sudah ada di folder saat ini
if [ -f "$APP_DIR/docker-compose.yml" ]; then
  warn "Aplikasi sudah ada di $APP_DIR"
  read -p "Update/reinstall? (y/N): " REINSTALL
  if [[ ! "$REINSTALL" =~ ^[Yy]$ ]]; then
    info "Melewati download, lanjut konfigurasi..."
    goto_config=true
  fi
fi

if [ -z "$goto_config" ]; then
  # Cari ZIP di folder saat ini
  ZIP_FILE=$(find /tmp /root /home -name "jualdanbeli*.zip" 2>/dev/null | head -1)
  if [ -n "$ZIP_FILE" ]; then
    info "Menggunakan ZIP yang ditemukan: $ZIP_FILE"
    cp "$ZIP_FILE" "$APP_DIR/"
  else
    warn "File ZIP tidak ditemukan secara otomatis."
    echo ""
    echo -e "${YELLOW}Upload file jualdanbeli-STANDALONE.zip ke VPS:${NC}"
    echo "  • Dari Termux: scp jualdanbeli-STANDALONE.zip root@IP-VPS:/opt/jualdanbeli/"
    echo "  • Dari Windows: pakai FileZilla/WinSCP ke /opt/jualdanbeli/"
    echo ""
    read -p "Tekan ENTER setelah upload ZIP, atau ketik path ZIP: " ZIP_PATH
    ZIP_PATH="${ZIP_PATH:-$APP_DIR/jualdanbeli-STANDALONE.zip}"
  fi

  ZIP_FILE="${ZIP_FILE:-$ZIP_PATH}"
  if [ ! -f "$ZIP_FILE" ]; then
    err "File ZIP tidak ditemukan di: $ZIP_FILE"
  fi

  info "Mengekstrak aplikasi..."
  unzip -o "$ZIP_FILE" -d "$APP_DIR" -q
  # Kalau extract ke subfolder, pindahkan
  INNER=$(ls "$APP_DIR" | grep -v "jualdanbeli.*\.zip" | head -1)
  if [ -d "$APP_DIR/$INNER" ] && [ -f "$APP_DIR/$INNER/docker-compose.yml" ]; then
    info "Memindahkan dari subfolder $INNER..."
    mv "$APP_DIR/$INNER"/* "$APP_DIR/" 2>/dev/null || true
    rmdir "$APP_DIR/$INNER" 2>/dev/null || true
  fi
  ok "Aplikasi terekstrak"
fi

# ── Konfigurasi .env ──────────────────────────────────────────────
step "6/7 - Konfigurasi aplikasi"
ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ] && [ -f "$APP_DIR/.env.example" ]; then
  cp "$APP_DIR/.env.example" "$ENV_FILE"
fi

if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << 'ENVEOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://jualdanbeli:rahasia123@db:5432/jualdanbeli
SESSION_SECRET=ganti_dengan_string_acak_minimal_32_karakter
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
RAJAONGKIR_API_KEY=
RESEND_API_KEY=
OPENAI_API_KEY=
ENVEOF
fi

# Generate random session secret
RAND_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 48 | head -n 1 2>/dev/null || echo "jualdanbeli_secret_$(date +%s)")
sed -i "s/ganti_dengan_string_acak_minimal_32_karakter/$RAND_SECRET/g" "$ENV_FILE"

echo ""
echo -e "${BOLD}Konfigurasi penting di file .env:${NC}"
echo -e "  File ada di: ${YELLOW}$ENV_FILE${NC}"
echo ""
echo -e "  Untuk edit: ${CYAN}nano $ENV_FILE${NC}"
echo ""
echo -e "  ${YELLOW}Wajib diisi (opsional):${NC}"
echo -e "  MIDTRANS_SERVER_KEY  → dari dashboard.midtrans.com"
echo -e "  RAJAONGKIR_API_KEY   → dari rajaongkir.com"
echo -e "  OPENAI_API_KEY       → dari platform.openai.com (untuk AI chat)"
echo ""
read -p "Edit .env sekarang? (y/N): " EDIT_ENV
if [[ "$EDIT_ENV" =~ ^[Yy]$ ]]; then
  nano "$ENV_FILE"
fi

# ── Jalankan aplikasi ─────────────────────────────────────────────
step "7/7 - Menjalankan aplikasi"
cd "$APP_DIR"

# Setup firewall
info "Konfigurasi firewall..."
$SUDO ufw allow 22/tcp --quiet 2>/dev/null || true   # SSH
$SUDO ufw allow 80/tcp --quiet 2>/dev/null || true   # HTTP
$SUDO ufw allow 443/tcp --quiet 2>/dev/null || true  # HTTPS
$SUDO ufw --force enable 2>/dev/null || true
ok "Firewall dikonfigurasi (port 22, 80, 443 terbuka)"

# Build & start
info "Membangun dan menjalankan container (pertama kali ~5-10 menit)..."
$SUDO docker compose down 2>/dev/null || true
$SUDO docker compose up --build -d

# Tunggu database siap
info "Menunggu database siap..."
sleep 10

ok "Aplikasi berhasil dijalankan!"

# ── Tampilkan info akses ──────────────────────────────────────────
IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         ✅ INSTALASI BERHASIL!                   ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}🌐 Akses Aplikasi:${NC}"
echo -e "  Marketplace    : ${CYAN}http://$IP${NC}"
echo -e "  Login Operator : ${CYAN}http://$IP/masuk-operator${NC}"
echo -e "  Login Admin    : ${CYAN}http://$IP/masuk-admin${NC}"
echo -e "  AI Chat CS     : ${CYAN}http://$IP/cs-ai${NC}"
echo ""
echo -e "${BOLD}🔑 Akun Default:${NC}"
echo -e "  Operator  : radjapamungkas007@gmail.com / Admin123!"
echo -e "  Seller 1  : seller1@jualdanbeli.com / Seller123!"
echo -e "  Buyer     : buyer@jualdanbeli.com / Buyer123!"
echo ""
echo -e "${YELLOW}⚠️  PENTING: Segera ganti semua password default!${NC}"
echo -e "  Edit konfigurasi: ${CYAN}nano $ENV_FILE${NC}"
echo -e "  Restart app     : ${CYAN}cd $APP_DIR && docker compose restart${NC}"
echo -e "  Lihat log       : ${CYAN}docker compose logs -f${NC}"
echo -e "  Stop app        : ${CYAN}docker compose down${NC}"
echo ""
echo -e "  Panduan lengkap : ${CYAN}cat $APP_DIR/CARA-INSTALL.md${NC}"
echo ""
echo -e "${BLUE}J&B™ jualdanbeli™ — © Hari Muhammad Hamzah${NC}"
