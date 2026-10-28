import type { GetFavoritesQuery } from "../modules/favorite/favorite.validation";
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      validatedQuery?: GetFavoritesQuery;
    }
  }
}

export {};
