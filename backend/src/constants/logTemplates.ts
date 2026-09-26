export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export"],
  RepairTicket: ["RepairTicket.create", "RepairTicket.update", "RepairTicket.status", "RepairTicket.export"],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export"],
  DispatchUrge: ["DispatchUrge.escalate", "DispatchUrge.open", "DispatchUrge.rescan", "DispatchUrge.close"],
  Dispatch: ["Dispatch.assign", "Dispatch.revoke", "Dispatch.scan", "Dispatch.reject"]
};
