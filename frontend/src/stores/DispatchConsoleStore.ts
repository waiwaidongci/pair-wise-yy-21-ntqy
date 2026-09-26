import { defineStore } from "pinia";
import {
  fetchDispatchBoard,
  listAvailableCrews,
  assignTicket,
  arriveTicket,
  restoreTicket
} from "../api/RepairTicket";
import { listUrgeTodos, closeUrgeTodo, scanUrgeTodos } from "../api/UrgeTodo";
import type { DispatchBoardRow } from "../types/DispatchBoard";
import type { UrgeTodo } from "../types/UrgeTodo";
import type { Crew } from "../types/Crew";

interface AssignState {
  ticketId: number;
  crews: Crew[];
  loading: boolean;
}

export const useDispatchConsoleStore = defineStore("dispatchConsole", {
  state: () => ({
    board: [] as DispatchBoardRow[],
    todos: [] as UrgeTodo[],
    loading: false,
    actionError: "",
    assign: null as AssignState | null
  }),
  getters: {
    waitingRows: (state) => state.board.filter((r) => r.ticket.status === "WAIT_DISPATCH"),
    overdueRows: (state) => state.board.filter((r) => r.is_overdue),
    openTodos: (state) => state.todos.filter((t) => t.status === "OPEN")
  },
  actions: {
    async refresh() {
      this.loading = true;
      this.actionError = "";
      try {
        const [board, todos] = await Promise.all([fetchDispatchBoard(), listUrgeTodos()]);
        this.board = board;
        this.todos = todos;
      } catch (err) {
        this.actionError = (err as Error).message;
      } finally {
        this.loading = false;
      }
    },
    async scanNow() {
      try {
        await scanUrgeTodos();
      } catch (err) {
        this.actionError = (err as Error).message;
      }
      await this.refresh();
    },
    async openAssign(ticketId: number) {
      this.actionError = "";
      this.assign = { ticketId, crews: [], loading: true };
      try {
        this.assign.crews = await listAvailableCrews(ticketId);
      } catch (err) {
        this.actionError = (err as Error).message;
      } finally {
        if (this.assign) this.assign.loading = false;
      }
    },
    closeAssign() {
      this.assign = null;
    },
    async doAssign(crewId: number) {
      if (!this.assign) return;
      try {
        await assignTicket(this.assign.ticketId, crewId);
        this.assign = null;
      } catch (err) {
        this.actionError = (err as Error).message;
      }
      await this.refresh();
    },
    async doArrive(ticketId: number) {
      await arriveTicket(ticketId);
      await this.refresh();
    },
    async doRestore(ticketId: number) {
      await restoreTicket(ticketId);
      await this.refresh();
    },
    async doCloseTodo(id: number, reason: string) {
      await closeUrgeTodo(id, reason);
      await this.refresh();
    }
  }
});
