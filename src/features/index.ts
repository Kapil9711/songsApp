import { Router } from "express";
const router = Router();
import userRoutes from "./user/user.routes.js";
import radioRoutes from "./radio/radio.routes.js";
import friendRoutes from "./friend/friend.routes.js";
import favoriteRoutes from "./favorite/favorite.routes.js";

router.use("/users", userRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/friends", friendRoutes);
router.use("/radios", radioRoutes);

export default router;
