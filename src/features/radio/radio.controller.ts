import type { Request, Response, NextFunction } from "express";
import { assertAuthenticated } from "../../helper/assertAuthenticated.js";
import { RadioService } from "./radio.services.js";

export class RadioController {
  static async addRadio(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;

      const favorite = await RadioService.addRadio(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Song added to favorites",
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getRadios(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { page, limit } = req.validatedQuery!;
      const result = await RadioService.getRadios(userId, {
        page,
        limit,
      });
      res.status(200).json({
        success: true,
        data: result.radios,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
  static async removeRadio(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { songId }: any = req.params;

      const radio = await RadioService.removeRadio(userId, songId);

      res.status(200).json({
        success: true,
        message: "Song removed from radios",
        data: radio,
      });
    } catch (error) {
      next(error);
    }
  }
  static async isRadio(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { songId }: any = req.params;

      const result = await RadioService.isRadio(userId, songId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
