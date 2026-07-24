# 📱 Panduan Install jualdanbeli via Termux (HP Android + VPS Ubuntu)

**Untuk: Hari Muhammad Hamzah**  
Panduan ini untuk menginstall aplikasi jualdanbeli di VPS Ubuntu menggunakan HP Android + Termux.

---

## Langkah 1 — Install Termux di HP Android

1. **Download Termux** dari F-Droid (BUKAN Google Play):
   ```
   https://f-droid.org/en/packages/com.termux/
   ```
2. Install dan buka Termux
3. Update Termux:
   ```bash
   pkg update && pkg upgrade -y
   ```
4. Install tools yang dibutuhkan:
   ```bash
   pkg install openssh openssl-tool wget unzip -y
   ```

---

## Langkah 2 — Upload File ZIP ke VPS

### Dari HP via Termux:
```bash
# Upload ZIP ke VPS (ganti IP dan path)
scp /sdcard/Download/jualdanbeli-STANDALONE.zip root@IP-VPS-ANDA:/opt/

# Contoh:
scp /sdcard/Download/jualdanbeli-STANDALONE.zip root@103.xxx.xxx.xxx:/opt/
```

> 💡 File ZIP bisa didownload dari aplikasi di Replit, lalu save ke folder Download HP Anda.

---

## Langkah 3 — Masuk ke VPS dari Termux

```bash
# Koneksi SSH ke VPS (ganti IP)
ssh root@IP-VPS-ANDA

# Contoh:
ssh root@103.xxx.xxx.xxx
```

> Masukkan password VPS Anda saat diminta.

---

## Langkah 4 — Jalankan Auto-Installer

Setelah masuk VPS, jalankan satu perintah ini:

```bash
# Upload install.sh ke VPS dulu, lalu:
chmod +x /opt/install.sh && /opt/install.sh

# ATAU cara cepat jika sudah ada script di server:
bash /opt/install.sh
```

**Script akan otomatis:**
- ✅ Update sistem Ubuntu
- ✅ Install Docker + Docker Compose
- ✅ Ekstrak aplikasi
- ✅ Generate password otomatis
- ✅ Jalankan semua layanan
- ✅ Tampilkan URL akses

---

## Langkah 5 — Akses Aplikasi

Setelah instalasi selesai, buka browser HP Anda:

| URL | Keterangan |
|-----|-----------|
| `http://IP-VPS-ANDA` | Marketplace utama |
| `http://IP-VPS-ANDA/masuk-operator` | Login khusus Anda (pemilik) |
| `http://IP-VPS-ANDA/masuk-admin` | Login staf admin |
| `http://IP-VPS-ANDA/cs-ai` | Fitur AI Chat CS |

---

## Perintah Berguna (dijalankan dari Termux via SSH)

```bash
# Cek status aplikasi
docker compose -f /opt/jualdanbeli/docker-compose.yml ps

# Restart aplikasi
docker compose -f /opt/jualdanbeli/docker-compose.yml restart

# Lihat log real-time
docker compose -f /opt/jualdanbeli/docker-compose.yml logs -f

# Stop aplikasi
docker compose -f /opt/jualdanbeli/docker-compose.yml down

# Update aplikasi (setelah upload ZIP baru)
cd /opt/jualdanbeli && docker compose up --build -d
```

---

## Pasang Domain (Opsional)

Jika punya domain di Domainesia:

1. Di panel Domainesia, arahkan DNS domain ke IP VPS:
   ```
   A record: @ → IP-VPS-ANDA
   A record: www → IP-VPS-ANDA
   ```

2. Di VPS, install SSL gratis:
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d domainanda.com -d www.domainanda.com
   ```

3. Aplikasi otomatis bisa diakses via HTTPS!

---

## Troubleshooting

**Docker tidak bisa jalan:**
```bash
systemctl start docker
systemctl enable docker
```

**Port 80 tidak bisa diakses:**
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

**Database error:**
```bash
docker compose -f /opt/jualdanbeli/docker-compose.yml logs db
```

**Reset semua (hati-hati, data terhapus):**
```bash
cd /opt/jualdanbeli
docker compose down -v
docker compose up --build -d
```

---

## Akun Default (Ganti Setelah Login!)

| Akun | Email | Password |
|------|-------|----------|
| **Operator/Pemilik** | radjapamungkas007@gmail.com | Admin123! |
| Seller 1 | seller1@jualdanbeli.com | Seller123! |
| Seller 2 | seller2@jualdanbeli.com | Seller123! |
| Buyer | buyer@jualdanbeli.com | Buyer123! |

---

**© Hari Muhammad Hamzah — J&B™ jualdanbeli™**
