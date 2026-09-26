import { computed, type Ref } from "vue";
import type { Crew } from "../types/Crew";
import { DutyStatus } from "../constants/DutyStatus";
import { parseSkillTags } from "../utils/formatters";

/**
 * 班组可派工判定：非离岗（OFF_DUTY）且无未结工单。
 * 可传 requiredSkill 进一步做技能匹配。
 */
export function useCrewAvailability(crews: Ref<Crew[]> | Crew[], requiredSkill?: Ref<string | undefined>) {
  const list = computed(() => ("value" in crews ? crews.value : crews));
  const available = computed(() =>
    list.value.filter((crew) => {
      if (crew.duty_status === DutyStatus[1]) return false;
      if (crew.current_ticket_id != null) return false;
      if (requiredSkill?.value && !parseSkillTags(crew.skill_tags).includes(requiredSkill.value)) return false;
      return true;
    })
  );
  const unavailableReason = (crew: Crew): string => {
    if (crew.duty_status === DutyStatus[1]) return "离岗";
    if (crew.current_ticket_id != null) return `未结工单 #${crew.current_ticket_id}`;
    if (requiredSkill?.value && !parseSkillTags(crew.skill_tags).includes(requiredSkill.value)) return "技能不匹配";
    return "";
  };
  return { available, unavailableReason };
}
