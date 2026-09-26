import { buildSeed } from "../seed"; const staticRows = buildSeed().sparePartUsage; export const sparePartUsageRepository = { findAll: () => staticRows, save: (row: unknown) => row };
