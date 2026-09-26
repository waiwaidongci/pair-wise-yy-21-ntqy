import { request } from "./request";
import type { Crew } from "../types/Crew";

const endpoint = "/api/crew";

export const listCrew = () => request<Crew[]>(endpoint);
