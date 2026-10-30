import { z } from "zod";

const imageSchema = z.object({
  quality: z.string().min(1),
  url: z.string().url(),
});

const downloadUrlSchema = z.object({
  quality: z.string().min(1),
  url: z.string().url(),
});

export const addFavoriteSchema = z.object({
  songId: z.string().trim().min(1, "Song ID is required"),
  name: z.string().trim().min(1, "Song name is required"),
  image: z.array(imageSchema).min(1, "At least one image is required"),
  downloadUrl: z
    .array(downloadUrlSchema)
    .min(1, "At least one download URL is required"),
  artist: z.string().optional(),
});

export const favoriteParamsSchema = z.object({
  songId: z.string().trim().min(1, "Song ID is required"),
});

export const getFavoritesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type GetFavoritesQuery = z.infer<typeof getFavoritesSchema>;
