import { Router } from "express";
import { urgeTodoController } from "../controllers/UrgeTodoController";

const router = Router();
router.get("/", urgeTodoController.list);
router.post("/scan", urgeTodoController.scan);
router.post("/:id/close", urgeTodoController.close);
export default router;
