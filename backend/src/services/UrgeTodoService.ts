import { urgeTodoRepository } from "../repositories/UrgeTodoRepository";
import { repairTicketService } from "./RepairTicketService";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "./RepairTicketService";

export const urgeTodoService = {
  list: (status?: string) => {
    const rows = urgeTodoRepository.findAll();
    return status ? rows.filter((t) => t.status === status) : rows;
  },

  /** 值班员手动解除催办；工单若再次超时，扫描会重新生成待办 */
  close: (id: number, reason = "手动解除") => {
    const todo = urgeTodoRepository.findById(id);
    if (!todo) throw new ServiceError(ERROR_CODES.TODO_NOT_FOUND, 404);
    if (todo.status === "CLOSED") return todo;
    const updated = urgeTodoRepository.update(id, {
      status: "CLOSED",
      closed_at: new Date().toISOString(),
      close_reason: reason
    })!;
    console.info(`[${LOG_TEMPLATES.UrgeTodo[1]}]`, JSON.stringify({ todo_id: id, reason }));
    return updated;
  },

  /** 手动触发一次超时扫描 */
  scanNow: () => repairTicketService.scanOverdue()
};
