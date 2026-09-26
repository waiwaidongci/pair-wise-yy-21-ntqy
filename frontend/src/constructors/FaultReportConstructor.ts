import type { FaultReport } from "../types/FaultReport";

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "NORMAL",
  report_channel: "95598",
  status: "OPEN",
  reported_at: new Date().toISOString(),
  ...overrides
});

export const createFaultReportForm = createDefaultFaultReport;
export const createFaultReportResponse = createDefaultFaultReport;
