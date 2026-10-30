import { Router } from "express";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  addRadioSchema,
  getRadioSchema,
  radioParamsSchema,
} from "./radio.validation.js";
import { RadioController } from "./radio.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(addRadioSchema), RadioController.addRadio);

router.get("/", validateQuery(getRadioSchema), RadioController.getRadios);

router.get(
  "/:songId",
  validateParams(radioParamsSchema),
  RadioController.isRadio,
);

router.delete(
  "/:songId",
  validateParams(radioParamsSchema),
  RadioController.removeRadio,
);

export default router;
