import mongoose from "mongoose";
import { AppError } from "../../helper/app-error.js";
import { AddFavoriteInput, GetFavoritesQuery } from "./favorite.validation.js";
import { FavoriteModel } from "./favorite.model.js";

export class FavoriteService {
  static async addFavorite(userId: string, data: AddFavoriteInput) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError(400, "Invalid user ID");
    }

    try {
      return await FavoriteModel.create({
        userId,
        ...data,
      });
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        throw new AppError(400, "Song is already in favorites");
      }

      throw error;
    }
  }

  static async getFavorites(userId: string, query: GetFavoritesQuery) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError(400, "Invalid user ID");
    }

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      FavoriteModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FavoriteModel.countDocuments({ userId }),
    ]);

    return {
      favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async removeFavorite(userId: string, songId: string) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError(400, "Invalid user ID");
    }

    const favorite = await FavoriteModel.findOneAndDelete({
      userId,
      songId,
    });

    if (!favorite) {
      throw new AppError(404, "Favorite song not found");
    }

    return favorite;
  }

  static async isFavorite(userId: string, songId: string) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError(400, "Invalid user ID");
    }

    const exists = await FavoriteModel.exists({
      userId,
      songId,
    });

    return { songId, isFavorite: Boolean(exists) };
  }
}
