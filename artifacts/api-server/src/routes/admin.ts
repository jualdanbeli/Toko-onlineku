import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, disputesTable, transactionsTable } from "@workspace/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const { q, status, role, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  let conditions: any[] = [];
  if (q) conditions.push(ilike(usersTable.name, `%${q}%`));
  if (status) conditions.push(eq(usersTable.status, status as any));
  if (role) conditions.push(eq(usersTable.role, role as any));

  const query = conditions.length > 0 ? and(...conditions) : undefined;
  const users = await db.select().from(usersTable).where(query as any).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(query as any);

  res.json({
    data: users.map(u => { const { passwordHash: _, ...safe } = u; return { ...safe, sellerInfo: { shopName: u.shopName, shopDescription: u.shopDescription, city: u.city, province: u.province, isVerified: u.isVerified } }; }),
    total: count,
    page: pageNum,
  });
});

router.patch("/admin/users/:userId/status", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const { status } = req.body;
  const [updated] = await db.update(usersTable).set({ status, updatedAt: new Date() }).where(eq(usersTable.id, userId)).returning();
  const { passwordHash: _, ...safe } = updated;
  res.json({ ...safe, sellerInfo: { shopName: updated.shopName, shopDescription: updated.shopDescription, city: updated.city, province: updated.province, isVerified: updated.isVerified } });
});

router.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const cond = status ? eq(productsTable.status, status as any) : undefined;
  const products = await db.select().from(productsTable).where(cond).orderBy(desc(productsTable.createdAt)).limit(limit).offset(offset);
  res.json(products.map(p => ({ ...p, price: parseFloat(p.price as string), originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : null, weight: null, averageRating: 0, totalReviews: 0, seller: null, category: null })));
});

router.patch("/admin/products/:productId/moderate", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const { status } = req.body;
  const [updated] = await db.update(productsTable).set({ status, updatedAt: new Date() }).where(eq(productsTable.id, productId)).returning();
  res.json({ ...updated, price: parseFloat(updated.price as string), originalPrice: updated.originalPrice ? parseFloat(updated.originalPrice as string) : null, weight: null, averageRating: 0, totalReviews: 0, seller: null, category: null });
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const cond = status ? eq(ordersTable.status, status as any) : undefined;
  const orders = await db.select().from(ordersTable).where(cond).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
  res.json(orders.map(o => ({ ...o, totalAmount: parseFloat(o.totalAmount as string), shippingCost: parseFloat(o.shippingCost as string), items: [], buyer: null, seller: null, dispute: null })));
});

router.get("/admin/disputes", requireAdmin, async (req, res): Promise<void> => {
  const disputes = await db.select().from(disputesTable).orderBy(desc(disputesTable.createdAt));
  res.json(disputes);
});

router.patch("/admin/disputes/:disputeId/resolve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.disputeId) ? req.params.disputeId[0] : req.params.disputeId;
  const disputeId = parseInt(raw, 10);
  const { ruling, outcome } = req.body;
  const [updated] = await db.update(disputesTable).set({ ruling, status: outcome }).where(eq(disputesTable.id, disputeId)).returning();

  // Update order escrow based on outcome
  if (outcome === "resolved_buyer") {
    await db.update(ordersTable).set({ escrowStatus: "refunded", status: "cancelled", updatedAt: new Date() }).where(eq(ordersTable.id, updated.orderId));
  } else if (outcome === "resolved_seller") {
    await db.update(ordersTable).set({ escrowStatus: "released", status: "completed", updatedAt: new Date() }).where(eq(ordersTable.id, updated.orderId));
  }

  res.json(updated);
});

router.get("/admin/withdrawals", requireAdmin, async (req, res): Promise<void> => {
  const { status } = req.query;
  let txs;
  if (status) {
    txs = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, status as any)))
      .orderBy(desc(transactionsTable.createdAt));
  } else {
    txs = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.type, "withdrawal"))
      .orderBy(desc(transactionsTable.createdAt));
  }
  res.json(txs.map(t => ({ ...t, amount: parseFloat(t.amount as string) })));
});

router.patch("/admin/withdrawals/:withdrawalId/process", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.withdrawalId) ? req.params.withdrawalId[0] : req.params.withdrawalId;
  const withdrawalId = parseInt(raw, 10);
  const { status, notes } = req.body;
  const [updated] = await db.update(transactionsTable).set({ status, ...(notes && { description: notes }) }).where(eq(transactionsTable.id, withdrawalId)).returning();
  res.json({ ...updated, amount: parseFloat(updated.amount as string) });
});

export default router;
