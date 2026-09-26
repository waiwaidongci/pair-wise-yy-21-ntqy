import type { Request, Response, NextFunction } from "express";
import { urgeTodoService } from "../services/UrgeTodoService";

export const urgeTodoController = {
  list: (req: Request, res: Response) =>
    res.json(urgeTodoService.list(typeof req.query.status === "string" ? req.query.status : undefined)),

  close: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(urgeTodoService.close(Number(req.params.id), req.body?.reason));
    } catch (err) {
      return next(err);
    }
  },

  scan: (_req: Request, res: Response) => res.json(urgeTodoService.scanNow())
};
