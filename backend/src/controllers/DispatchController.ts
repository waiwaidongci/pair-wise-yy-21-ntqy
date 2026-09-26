import type { NextFunction, Request, Response } from "express";
import { dispatchService } from "../services/DispatchService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const wrap = (fn: (req: Request, res: Response) => void) => (req: Request, res: Response, next: NextFunction) => {
  try {
    fn(req, res);
  } catch (err) {
    next(err);
  }
};

export const dispatchController = {
  overview: wrap((_req, res) => res.json(dispatchService.overview())),
  urges: wrap((_req, res) => res.json(dispatchService.listUrges())),
  scan: wrap((_req, res) => res.json(dispatchService.scan())),
  eligibleCrews: wrap((req, res) => {
    const ticketId = Number(req.query.ticket_id);
    if (!ticketId) throw { status: 400, code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
    res.json(dispatchService.eligibleCrews(ticketId));
  }),
  dispatch: wrap((req, res) => {
    const { ticket_id, team_id } = req.body ?? {};
    const dispatcherId = (req as unknown as { user?: { id: number } }).user?.id ?? 0;
    if (!ticket_id || !team_id) throw { status: 400, code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
    res.json(dispatchService.dispatch(Number(ticket_id), Number(team_id), dispatcherId));
  }),
  revoke: wrap((req, res) => {
    const { ticket_id } = req.body ?? {};
    if (!ticket_id) throw { status: 400, code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
    res.json(dispatchService.revoke(Number(ticket_id)));
  })
};
