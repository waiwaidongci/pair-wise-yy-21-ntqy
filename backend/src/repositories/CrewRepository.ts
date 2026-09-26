import { store } from "../data/store";
import type { Crew } from "../models/Crew";

export const crewRepository = {
  findAll: (): Crew[] => store.crews,
  findById: (id: number): Crew | undefined => store.crews.find((c) => c.id === id),
  save: (row: Omit<Crew, "id"> & { id?: number }): Crew => {
    const crew = { ...row, id: row.id ?? store.nextId("crew") } as Crew;
    store.crews.push(crew);
    store.save();
    return crew;
  },
  update: (id: number, patch: Partial<Crew>): Crew | undefined => {
    const crew = store.crews.find((c) => c.id === id);
    if (!crew) return undefined;
    Object.assign(crew, patch);
    store.save();
    return crew;
  }
};
