import fs from "node:fs";
import path from "node:path";
import { config } from "../config/env";
import { buildSeed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import type { DispatchUrge } from "../models/DispatchUrge";

export interface StoreData {
  faultReport: FaultReport[];
  repairTicket: RepairTicket[];
  crew: Crew[];
  dispatchUrge: DispatchUrge[];
}

let cache: StoreData | null = null;

// 本地 JSON 文件持久化：进程重启后重新加载，催办待办与工单状态不丢失。
export function loadStore(): StoreData {
  if (cache) return cache;
  const file = config.dataFile;
  if (fs.existsSync(file)) {
    cache = JSON.parse(fs.readFileSync(file, "utf-8")) as StoreData;
  } else {
    const seed = buildSeed();
    cache = {
      faultReport: seed.faultReport,
      repairTicket: seed.repairTicket,
      crew: seed.crew,
      dispatchUrge: seed.dispatchUrge as DispatchUrge[]
    };
    persist();
  }
  return cache as StoreData;
}

export function persist(): void {
  if (!cache) return;
  const file = config.dataFile;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(cache, null, 2));
}
