import { defineStore } from "pinia";
import {
  fetchDispatchOverview,
  fetchDispatchUrges,
  fetchEligibleCrews,
  postDispatch,
  postDispatchScan,
  postRevoke
} from "../api/Dispatch";
import type { CrewEligibility, DispatchOverview } from "../types/DispatchOverview";
import type { DispatchUrge } from "../types/DispatchUrge";

export const useDispatchStore = defineStore("dispatch", {
  state: () => ({
    overview: null as DispatchOverview | null,
    urges: [] as DispatchUrge[],
    eligibility: {} as Record<number, CrewEligibility[]>,
    loading: false,
    error: ""
  }),
  getters: {
    openUrges: (state) => state.urges.filter((u) => u.status === "OPEN"),
    closedUrges: (state) => state.urges.filter((u) => u.status === "CLOSED")
  },
  actions: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const [overview, urges] = await Promise.all([fetchDispatchOverview(), fetchDispatchUrges()]);
        this.overview = overview;
        this.urges = urges;
      } catch (err) {
        this.error = err instanceof Error ? err.message : "加载失败";
      } finally {
        this.loading = false;
      }
    },
    async scan() {
      await postDispatchScan();
      await this.load();
    },
    async loadEligibility(ticketId: number) {
      this.eligibility[ticketId] = await fetchEligibleCrews(ticketId);
    },
    async dispatch(ticketId: number, teamId: number) {
      this.error = "";
      try {
        await postDispatch(ticketId, teamId);
        delete this.eligibility[ticketId];
        await this.load();
        return true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : "派工失败";
        return false;
      }
    },
    async revoke(ticketId: number) {
      this.error = "";
      try {
        await postRevoke(ticketId);
        await this.load();
        return true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : "撤销失败";
        return false;
      }
    }
  }
});
