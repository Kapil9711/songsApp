import { Router } from "express";
import { FavoriteController } from "./favorite.controller.js";
import {
  addFavoriteSchema,
  favoriteParamsSchema,
  getFavoritesSchema,
} from "./favorite.validation.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateBody(addFavoriteSchema),
  FavoriteController.addFavorite,
);

router.get(
  "/",
  validateQuery(getFavoritesSchema),
  FavoriteController.getFavorites,
);

router.get(
  "/:songId",
  validateParams(favoriteParamsSchema),
  FavoriteController.isFavorite,
);

router.delete(
  "/:songId",
  validateParams(favoriteParamsSchema),
  FavoriteController.removeFavorite,
);

export default router;
