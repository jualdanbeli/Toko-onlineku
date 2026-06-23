import { Router, type IRouter } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";
import { hashPassword, generateToken, requireAuth } from "../lib/auth";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../lib/email";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name, email, phone, passwordHash,
    role: role === "seller" ? "seller" : "buyer",
    status: "active",
  }).returning();

  await db.insert(walletsTable).values({ userId: user.id, balance: "0", pendingBalance: "0" });

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  res.status(201).json({ user: safeUser, token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing credentials" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (user.status === "banned") {
    res.status(403).json({ error: "Account banned" });
    return;
  }
  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    res.status(400).json({ error: "Email atau nomor HP wajib diisi" }); return;
  }
  const trimmed = emailOrPhone.trim();
  const [user] = await db.select().from(usersTable).where(
    or(eq(usersTable.email, trimmed), eq(usersTable.phone, trimmed))
  );
  if (!user) {
    res.json({ message: "Jika akun ditemukan, link reset akan dikirim ke email terdaftar." }); return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  await db.update(usersTable).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(usersTable.id, user.id));
  const APP_URL = process.env.APP_URL ?? "https://jualdanbeli.replit.app";
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  sendPasswordResetEmail(user.email, { name: user.name, resetLink }).catch(() => {});
  res.json({ message: "Jika akun ditemukan, link reset akan dikirim ke email terdaftar." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ error: "Token dan password baru wajib diisi" }); return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: "Password minimal 8 karakter" }); return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "Link reset tidak valid atau sudah kadaluarsa. Minta link baru." }); return;
  }
  await db.update(usersTable).set({
    passwordHash: hashPassword(newPassword),
    resetToken: null,
    resetTokenExpiry: null,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password berhasil direset. Silakan login dengan password baru." });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const { passwordHash: _, ...safeUser } = user;
  const sellerInfo = {
    shopName: user.shopName ?? null,
    shopDescription: user.shopDescription ?? null,
    city: user.city ?? null,
    province: user.province ?? null,
    isVerified: user.isVerified,
  };
  res.json({ ...safeUser, sellerInfo });
});

export default router;
