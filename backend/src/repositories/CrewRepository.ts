import { loadStore, persist } from "../utils/jsonStore";
import type { Crew } from "../models/Crew";

export const crewRepository = {
  findAll: (): Crew[] => loadStore().crew,
  findById: (id: number): Crew | undefined => loadStore().crew.find((row) => row.id === id),
  save(row: Partial<Crew>): Crew {
    const store = loadStore();
    const next = { ...row, id: row.id ?? Math.max(0, ...store.crew.map((c) => c.id)) + 1 } as Crew;
    store.crew.push(next);
    persist();
    return next;
  },
  update(row: Crew): Crew {
    const store = loadStore();
    const index = store.crew.findIndex((c) => c.id === row.id);
    if (index >= 0) store.crew[index] = row;
    persist();
    return row;
  }
};
