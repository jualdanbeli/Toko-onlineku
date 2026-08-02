-- ============================================================
--  jualdanbeli — Database Init Script
--  Jalankan sekali untuk buat semua tabel dan akun admin
--  Aman dijalankan berulang (IF NOT EXISTS)
-- ============================================================

-- ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('buyer','seller','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active','suspended','banned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE product_condition AS ENUM ('new','used');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('active','pending','flagged','removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending_payment','paid','confirmed','shipped','delivered','completed','cancelled','disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE escrow_status AS ENUM ('holding','released','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open','investigating','resolved_buyer','resolved_seller','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('sale','withdrawal','refund','topup');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending','completed','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('order_update','payment','message','review','dispute','promo','system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE report_target_type AS ENUM ('user','product','review','message');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending','investigating','resolved','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE voucher_type AS ENUM ('percentage','fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE bill_type AS ENUM ('pln_pascabayar','pln_prepaid','bpjs_kesehatan','bpjs_ketenagakerjaan','pdam','telepon','internet','finance','tv_kabel','pulsa','paket_data','pbb','stnk','gas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE bill_payment_status AS ENUM ('pending','success','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLES
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  status user_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  shop_name TEXT,
  shop_description TEXT,
  city TEXT,
  province TEXT,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  reset_token TEXT,
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT
);

CREATE TABLE IF NOT EXISTS couriers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(15,2) NOT NULL,
  original_price NUMERIC(15,2),
  stock INTEGER NOT NULL DEFAULT 0,
  condition product_condition NOT NULL,
  status product_status NOT NULL DEFAULT 'active',
  seller_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  images TEXT[] NOT NULL DEFAULT '{}',
  weight NUMERIC(10,2),
  city TEXT,
  total_sold INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'pending_payment',
  total_amount NUMERIC(15,2) NOT NULL,
  shipping_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  shipping_address TEXT NOT NULL,
  courier_id INTEGER,
  tracking_number TEXT,
  escrow_status escrow_status NOT NULL DEFAULT 'holding',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) UNIQUE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  dispute_type TEXT NOT NULL DEFAULT 'other',
  courier_name TEXT,
  tracking_number TEXT,
  escalated_to_courier TEXT DEFAULT 'no',
  escalated_at TIMESTAMP,
  insurance_claim_status TEXT DEFAULT 'none',
  insurance_claim_id TEXT,
  insurance_amount NUMERIC(15,2),
  status dispute_status NOT NULL DEFAULT 'open',
  ruling TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  frozen_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_id INTEGER REFERENCES orders(id),
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  description TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  participant1_id INTEGER NOT NULL REFERENCES users(id),
  participant2_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  last_message TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  target_type report_target_type NOT NULL,
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  resolution TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type voucher_type NOT NULL,
  value NUMERIC(15,2) NOT NULL,
  min_order NUMERIC(15,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(15,2),
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  peak_viewers INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_chats (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES live_sessions(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  user_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_featured_products (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES live_sessions(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ban_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  bill_type bill_type NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15,0) NOT NULL,
  admin_fee NUMERIC(15,0) NOT NULL DEFAULT 2500,
  total_amount NUMERIC(15,0) NOT NULL,
  status bill_payment_status NOT NULL DEFAULT 'pending',
  reference_no TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Admin user (password: Admin123!)
INSERT INTO users (name,email,phone,password_hash,role,status,is_verified,city,province,created_at,updated_at)
VALUES ('Hari Muhammad Hamzah','radjapamungkas007@gmail.com','081297785448',
        '9ebcbe1b2c80bb3c89fd4a8f0e9f10e3a7be5635f93e202b4d500f2130665f33',
        'admin','active',true,'Jakarta','DKI Jakarta',NOW(),NOW())
ON CONFLICT (email) DO UPDATE
  SET password_hash='9ebcbe1b2c80bb3c89fd4a8f0e9f10e3a7be5635f93e202b4d500f2130665f33',
      role='admin', status='active', is_verified=true, updated_at=NOW();

-- Admin wallet
INSERT INTO wallets (user_id,balance,pending_balance,frozen_balance)
SELECT id,0,0,0 FROM users WHERE email='radjapamungkas007@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Default categories
INSERT INTO categories (name, slug, icon_url) VALUES
  ('Elektronik','elektronik','https://cdn-icons-png.flaticon.com/512/3659/3659899.png'),
  ('Fashion Pria','fashion-pria','https://cdn-icons-png.flaticon.com/512/892/892458.png'),
  ('Fashion Wanita','fashion-wanita','https://cdn-icons-png.flaticon.com/512/3531/3531990.png'),
  ('Makanan & Minuman','makanan-minuman','https://cdn-icons-png.flaticon.com/512/3448/3448609.png'),
  ('Kesehatan & Kecantikan','kesehatan-kecantikan','https://cdn-icons-png.flaticon.com/512/3208/3208715.png'),
  ('Rumah & Dapur','rumah-dapur','https://cdn-icons-png.flaticon.com/512/2784/2784459.png'),
  ('Olahraga','olahraga','https://cdn-icons-png.flaticon.com/512/3209/3209065.png'),
  ('Otomotif','otomotif','https://cdn-icons-png.flaticon.com/512/741/741407.png'),
  ('Buku & Alat Tulis','buku-alat-tulis','https://cdn-icons-png.flaticon.com/512/2232/2232688.png'),
  ('Hobi & Mainan','hobi-mainan','https://cdn-icons-png.flaticon.com/512/3082/3082048.png')
ON CONFLICT (slug) DO NOTHING;

-- Default couriers
INSERT INTO couriers (name, code, logo_url) VALUES
  ('JNE Regular','jne','https://seeklogo.com/images/J/jne-logo-B7BA8D5F6B-seeklogo.com.png'),
  ('J&T Express','jnt','https://seeklogo.com/images/J/j-t-express-logo-E83A53B6A0-seeklogo.com.png'),
  ('SiCepat','sicepat','https://seeklogo.com/images/S/sicepat-logo-6B44F8C4E4-seeklogo.com.png'),
  ('Anteraja','anteraja','https://seeklogo.com/images/A/anteraja-logo-1FEDCE8CAF-seeklogo.com.png'),
  ('Pos Indonesia','pos','https://seeklogo.com/images/P/pos-indonesia-logo-9034DFE5B2-seeklogo.com.png')
ON CONFLICT (code) DO NOTHING;

-- Confirm
SELECT 'Tables created: ' || count(*)::text FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE';
SELECT 'Admin: ' || email || ' role=' || role::text || ' status=' || status::text
FROM users WHERE email='radjapamungkas007@gmail.com';
