import express from "express";
import { patchConfirmMeasureValidation, postMeasureValidation } from "../middlewares/measureValidation";
import { confirmMeasure, registerMeasure } from "../controllers/measureController";
import { imageLocalUpload } from "../middlewares/imageUpload";
import { validate } from "../middlewares/handleValidation";

const router = express.Router();

router.post("/upload", imageLocalUpload.single("image"), postMeasureValidation(), validate, registerMeasure);
router.patch("/confirm", patchConfirmMeasureValidation(), validate, confirmMeasure);

module.exports = router;