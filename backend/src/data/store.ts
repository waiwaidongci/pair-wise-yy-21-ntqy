import fs from "node:fs";
import path from "node:path";
import { config } from "../config/env";
import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import type { UrgeTodo } from "../models/UrgeTodo";

export interface GridRepairData {
  repairTicket: RepairTicket[];
  faultReport: FaultReport[];
  crew: Crew[];
  urgeTodo: UrgeTodo[];
}

/**
 * 本地 JSON 文件持久化：首次启动用种子数据初始化，之后每次写操作落盘，
 * 进程/容器重启后从文件恢复，超时催办待办仍可查询。
 */
class FileStore {
  private data: GridRepairData;

  constructor() {
    this.data = this.load();
  }

  private load(): GridRepairData {
    const file = path.resolve(config.dataFile);
    try {
      if (fs.existsSync(file)) {
        const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<GridRepairData>;
        return {
          repairTicket: parsed.repairTicket ?? [],
          faultReport: parsed.faultReport ?? [],
          crew: parsed.crew ?? [],
          urgeTodo: parsed.urgeTodo ?? []
        };
      }
    } catch (err) {
      console.error("store.load failed, reseed:", err);
    }
    const fresh: GridRepairData = {
      repairTicket: seed.repairTicket.map((r) => ({ ...r })),
      faultReport: seed.faultReport.map((r) => ({ ...r })),
      crew: seed.crew.map((r) => ({ ...r })),
      urgeTodo: []
    };
    this.persist(fresh);
    return fresh;
  }

  private persist(data: GridRepairData = this.data) {
    const file = path.resolve(config.dataFile);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  }

  get tickets() { return this.data.repairTicket; }
  get reports() { return this.data.faultReport; }
  get crews() { return this.data.crew; }
  get todos() { return this.data.urgeTodo; }

  nextId<K extends keyof GridRepairData>(key: K): number {
    const rows = this.data[key] as Array<{ id: number }>;
    return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }

  /** 每次写操作后调用，落盘保证重启可查询 */
  save() {
    this.persist();
  }
}

export const store = new FileStore();
