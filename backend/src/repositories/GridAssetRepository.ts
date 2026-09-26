import { buildSeed } from "../seed"; const staticRows = buildSeed().gridAsset; export const gridAssetRepository = { findAll: () => staticRows, save: (row: unknown) => row };
