import type { Request, Response, NextFunction } from "express";
import { repairTicketService } from "../services/RepairTicketService";

/** controller 层只做 HTTP 语义包装，业务异常交给 errorHandlerMiddleware */
export const repairTicketController = {
  list: (_req: Request, res: Response) => res.json(repairTicketService.list()),

  board: (_req: Request, res: Response) => res.json(repairTicketService.board()),

  create: (req: Request, res: Response) => res.status(201).json(repairTicketService.create(req.body)),

  assign: (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticketId = Number(req.params.id);
      const { crew_id, dispatcher_id } = req.body ?? {};
      if (!crew_id) return res.status(400).json({ code: "VALIDATION_FAILED", message: "crew_id 必填" });
      const result = repairTicketService.assign(ticketId, Number(crew_id), Number(dispatcher_id ?? 1));
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  arrive: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(repairTicketService.arrive(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },

  restore: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(repairTicketService.restore(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },

  availableCrews: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(repairTicketService.availableCrews(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  }
};
