import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hospitalsRouter from "./hospitals";
import inventoryRouter from "./inventory";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hospitalsRouter);
router.use(inventoryRouter);
router.use(dashboardRouter);

export default router;
