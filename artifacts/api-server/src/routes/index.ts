import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import liderancasRouter from "./liderancas";
import apoiadoresRouter from "./apoiadores";
import prospeccaoRouter from "./prospeccao";
import zonasRouter from "./zonas";
import agendaRouter from "./agenda";
import demandasRouter from "./demandas";
import mapassRouter from "./mapas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(liderancasRouter);
router.use(apoiadoresRouter);
router.use(prospeccaoRouter);
router.use(zonasRouter);
router.use(agendaRouter);
router.use(demandasRouter);
router.use(mapassRouter);

export default router;
