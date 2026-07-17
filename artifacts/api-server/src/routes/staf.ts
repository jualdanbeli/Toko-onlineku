import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { requireOwner } from "../lib/auth";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "jualdanbeli_salt_2024").digest("hex");
}

// Ambil daftar semua staf admin (bukan pemilik)
router.get("/admin/staf", requireOwner, async (req, res): Promise<void> => {
  const OWNER_EMAIL = "radjapamungkas007@gmail.com";
  const staf = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, "admin"), ne(usersTable.email, OWNER_EMAIL)));

  res.json({ staf });
});

// Tambah staf admin baru
router.post("/admin/staf", requireOwner, async (req, res): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Nama, email, dan password wajib diisi" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password minimal 8 karakter" });
    return;
  }

  // Cek email sudah ada
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email sudah terdaftar" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    phone: "",
    passwordHash: hashPassword(password),
    role: "admin",
    status: "active",
  }).returning({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    status: usersTable.status,
  });

  req.log.info({ userId: user.id, email: user.email }, "New admin staff added by owner");
  res.status(201).json({ message: "Staf admin berhasil ditambahkan", user });
});

// Nonaktifkan/aktifkan staf
router.patch("/admin/staf/:id/status", requireOwner, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!["active", "suspended"].includes(status)) {
    res.status(400).json({ error: "Status tidak valid" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ status })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id, name: usersTable.name, status: usersTable.status });

  if (!updated) {
    res.status(404).json({ error: "Staf tidak ditemukan" });
    return;
  }

  req.log.info({ targetId: id, newStatus: status }, "Staff status updated by owner");
  res.json({ message: "Status staf diperbarui", user: updated });
});

// Hapus staf
router.delete("/admin/staf/:id", requireOwner, async (req, res): Promise<void> => {
  const id = Number(req.params.id);

  const [deleted] = await db
    .delete(usersTable)
    .where(and(eq(usersTable.id, id), eq(usersTable.role, "admin")))
    .returning({ id: usersTable.id, name: usersTable.name });

  if (!deleted) {
    res.status(404).json({ error: "Staf tidak ditemukan atau bukan admin" });
    return;
  }

  req.log.info({ deletedId: id }, "Admin staff removed by owner");
  res.json({ message: "Staf berhasil dihapus" });
});

// Reset password staf
router.patch("/admin/staf/:id/reset-password", requireOwner, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { password } = req.body;

  if (!password || password.length < 8) {
    res.status(400).json({ error: "Password minimal 8 karakter" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ passwordHash: hashPassword(password) })
    .where(and(eq(usersTable.id, id), eq(usersTable.role, "admin")))
    .returning({ id: usersTable.id, name: usersTable.name });

  if (!updated) {
    res.status(404).json({ error: "Staf tidak ditemukan" });
    return;
  }

  req.log.info({ targetId: id }, "Staff password reset by owner");
  res.json({ message: "Password staf berhasil direset" });
});

export default router;
