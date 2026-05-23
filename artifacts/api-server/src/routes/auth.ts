import { Router, type IRouter } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, requireAuth } from "../lib/auth";

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
