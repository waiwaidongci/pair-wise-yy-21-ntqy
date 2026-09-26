export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? "localhost",
  /** 本地持久化数据文件（重启后仍可查询） */
  dataFile: process.env.DATA_FILE ?? "./data/grid-repair.json",
  /** 超时扫描间隔（毫秒） */
  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS ?? 30000)
};
