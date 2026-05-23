import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import shippingRouter from "./shipping";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";
import supportRouter from "./support";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(shippingRouter);
router.use(messagesRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(dashboardRouter);
router.use(supportRouter);

export default router;
