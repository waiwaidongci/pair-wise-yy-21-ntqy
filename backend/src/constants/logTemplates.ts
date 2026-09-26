export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export"],
  RepairTicket: [
    "RepairTicket.create",
    "RepairTicket.assign",
    "RepairTicket.arrive",
    "RepairTicket.restore",
    "RepairTicket.escalate"
  ],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export"],
  UrgeTodo: ["UrgeTodo.create", "UrgeTodo.close", "UrgeTodo.reopen", "UrgeTodo.scan"]
};
