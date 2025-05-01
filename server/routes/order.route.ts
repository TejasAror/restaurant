import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  getOrders,
  stripeWebhook
} from "../controller/order.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.route("/").get(asyncHandler(isAuthenticated), asyncHandler(getOrders));

router
  .route("/checkout/create-checkout-session")
  .post(asyncHandler(isAuthenticated), asyncHandler(createCheckoutSession));

router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), asyncHandler(stripeWebhook));

export default router;
