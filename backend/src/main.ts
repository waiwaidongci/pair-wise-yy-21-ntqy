import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { authMiddleware } from "./middlewares/authMiddleware";
import { auditLogMiddleware } from "./middlewares/auditLogMiddleware";
import { requestLoggerMiddleware } from "./middlewares/requestLoggerMiddleware";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import gridAssetRoutes from "./routes/GridAssetRoutes";
import faultReportRoutes from "./routes/FaultReportRoutes";
import repairTicketRoutes from "./routes/RepairTicketRoutes";
import crewRoutes from "./routes/CrewRoutes";
import sparePartUsageRoutes from "./routes/SparePartUsageRoutes";
import urgeTodoRoutes from "./routes/UrgeTodoRoutes";
import { repairTicketService } from "./services/RepairTicketService";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(authMiddleware);
app.use(auditLogMiddleware);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "grid-repair" }));
app.use("/api/grid-asset", gridAssetRoutes);
app.use("/api/fault-report", faultReportRoutes);
app.use("/api/repair-ticket", repairTicketRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/spare-part-usage", sparePartUsageRoutes);
app.use("/api/urge-todo", urgeTodoRoutes);
app.use(errorHandlerMiddleware);

// 启动即扫描一次，之后按间隔轮扫超时未派工工单
repairTicketService.scanOverdue();
setInterval(() => repairTicketService.scanOverdue(), config.scanIntervalMs).unref();

app.listen(config.port, () => console.log("grid-repair backend listening on", config.port));
