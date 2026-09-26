import path from "node:path";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? "localhost",
  // 本地 JSON 持久化文件，重启后催办待办与工单状态仍可查询
  dataFile: process.env.DATA_FILE ?? path.join(process.cwd(), "data", "store.json"),
  escalationTimeoutMinutes: Number(process.env.ESCALATION_TIMEOUT_MINUTES ?? 15),
  scanIntervalMs: Number(process.env.DISPATCH_SCAN_INTERVAL_MS ?? 60000)
};
