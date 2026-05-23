import { Router, type IRouter } from "express";
import { db, couriersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/shipping/couriers", async (_req, res): Promise<void> => {
  const couriers = await db.select().from(couriersTable);
  res.json(couriers);
});

router.post("/shipping/calculate", async (req, res): Promise<void> => {
  const { originCity, destinationCity, weight } = req.body;
  if (!originCity || !destinationCity || !weight) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  const couriers = await db.select().from(couriersTable);
  const options = couriers.flatMap(c => [
    {
      courierId: c.id,
      courierName: c.name,
      service: "REG",
      cost: Math.round(weight * 1200 + 8000),
      estimatedDays: "2-3 hari",
    },
    {
      courierId: c.id,
      courierName: c.name,
      service: "YES",
      cost: Math.round(weight * 1800 + 15000),
      estimatedDays: "1-2 hari",
    },
  ]);

  res.json(options);
});

router.get("/shipping/track/:trackingNumber", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.trackingNumber) ? req.params.trackingNumber[0] : req.params.trackingNumber;
  const trackingNumber = raw;

  // Simulated tracking response
  res.json({
    trackingNumber,
    status: "In Transit",
    courierName: "JNE",
    history: [
      { timestamp: new Date(Date.now() - 86400000).toISOString(), location: "Jakarta Pusat", description: "Paket diterima di gudang" },
      { timestamp: new Date(Date.now() - 43200000).toISOString(), location: "Jakarta Barat", description: "Paket dalam pengiriman" },
      { timestamp: new Date().toISOString(), location: "Area tujuan", description: "Paket sedang diantar" },
    ],
  });
});

export default router;
