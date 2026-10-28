import type { Request, Response, NextFunction } from "express";
import { FavoriteService } from "./favorite.services.js";
import { assertAuthenticated } from "../../helper/assertAuthenticated.js";

export class FavoriteController {
  static async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;

      const favorite = await FavoriteService.addFavorite(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Song added to favorites",
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { page, limit } = req.validatedQuery!;
      const result = await FavoriteService.getFavorites(userId, {
        page,
        limit,
      });
      res.status(200).json({
        success: true,
        data: result.favorites,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
  static async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { songId }: any = req.params;

      const favorite = await FavoriteService.removeFavorite(userId, songId);

      res.status(200).json({
        success: true,
        message: "Song removed from favorites",
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }
  static async isFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      assertAuthenticated(req);
      const userId = req.userId;
      const { songId }: any = req.params;

      const result = await FavoriteService.isFavorite(userId, songId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
