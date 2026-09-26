import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();
router.get("/", repairTicketController.list);
router.get("/board", repairTicketController.board);
router.post("/", repairTicketController.create);
router.post("/:id/assign", repairTicketController.assign);
router.post("/:id/arrive", repairTicketController.arrive);
router.post("/:id/restore", repairTicketController.restore);
router.get("/:id/available-crews", repairTicketController.availableCrews);
export default router;
