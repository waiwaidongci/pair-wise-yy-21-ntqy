import { loadStore, persist } from "../utils/jsonStore";
import type { FaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll: (): FaultReport[] => loadStore().faultReport,
  findById: (id: number): FaultReport | undefined => loadStore().faultReport.find((row) => row.id === id),
  save(row: Partial<FaultReport>): FaultReport {
    const store = loadStore();
    const next = { ...row, id: row.id ?? Math.max(0, ...store.faultReport.map((r) => r.id)) + 1 } as FaultReport;
    store.faultReport.push(next);
    persist();
    return next;
  }
};
