import { store } from "../data/store";
import type { FaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll: (): FaultReport[] => store.reports,
  findById: (id: number): FaultReport | undefined => store.reports.find((r) => r.id === id),
  save: (row: Omit<FaultReport, "id"> & { id?: number }): FaultReport => {
    const report = { ...row, id: row.id ?? store.nextId("faultReport") } as FaultReport;
    store.reports.push(report);
    store.save();
    return report;
  },
  update: (id: number, patch: Partial<FaultReport>): FaultReport | undefined => {
    const report = store.reports.find((r) => r.id === id);
    if (!report) return undefined;
    Object.assign(report, patch);
    store.save();
    return report;
  }
};
