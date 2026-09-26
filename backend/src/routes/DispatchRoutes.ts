import { Router } from "express";
import { dispatchController } from "../controllers/DispatchController";

const router = Router();
router.get("/overview", dispatchController.overview);
router.get("/urges", dispatchController.urges);
router.post("/scan", dispatchController.scan);
router.get("/eligible-crews", dispatchController.eligibleCrews);
router.post("/dispatch", dispatchController.dispatch);
router.post("/revoke", dispatchController.revoke);
export default router;
