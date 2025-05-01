import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { checkAuth, forgotPassword, login, logout, resetPassword, signup, updateProfile, verifyEmail } from "../controller/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();


router.route("/check-auth").get(asyncHandler(isAuthenticated), asyncHandler(checkAuth));
router.route("/signup").post(asyncHandler(signup));
router.route("/login").post(asyncHandler(login));
router.route("/logout").post(asyncHandler(logout));
router.route("/verify-email").post(asyncHandler(verifyEmail));
router.route("/forgot-password").post(asyncHandler(forgotPassword));
router.route("/reset-password/:token").post(asyncHandler(resetPassword));
router.route("/profile/update").put(asyncHandler(isAuthenticated),asyncHandler(updateProfile));

export default router;