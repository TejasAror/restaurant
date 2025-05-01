import express from "express";
import upload from "../middlewares/multer.js"; // 👈 .js extension added
import { isAuthenticated } from "../middlewares/isAuthenticated.js"; // 👈 .js extension added
import { addMenu, editMenu } from "../controller/menu.controller.js"; // 👈 .js extension added
import { asyncHandler } from "../utils/asyncHandler.js"; // 👈 .js extension added

const router = express.Router();

router
  .route("/")
  .post(asyncHandler(isAuthenticated), upload.single("image"), asyncHandler(addMenu));

router
  .route("/:id")
  .put(asyncHandler(isAuthenticated), upload.single("image"), asyncHandler(editMenu));

export default router;
