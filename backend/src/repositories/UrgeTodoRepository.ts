import { store } from "../data/store";
import type { UrgeTodo } from "../models/UrgeTodo";

export const urgeTodoRepository = {
  findAll: (): UrgeTodo[] => store.todos,
  findById: (id: number): UrgeTodo | undefined => store.todos.find((t) => t.id === id),
  findOpenByTicket: (ticketId: number): UrgeTodo | undefined =>
    store.todos.find((t) => t.ticket_id === ticketId && t.status === "OPEN"),
  save: (row: Omit<UrgeTodo, "id"> & { id?: number }): UrgeTodo => {
    const todo = { ...row, id: row.id ?? store.nextId("urgeTodo") } as UrgeTodo;
    store.todos.push(todo);
    store.save();
    return todo;
  },
  update: (id: number, patch: Partial<UrgeTodo>): UrgeTodo | undefined => {
    const todo = store.todos.find((t) => t.id === id);
    if (!todo) return undefined;
    Object.assign(todo, patch);
    store.save();
    return todo;
  }
};
