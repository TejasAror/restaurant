import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  getRestaurantOrder,
  updateOrderStatus,
  searchRestaurant,
  getSingleRestaurant
} from "../controller/restaurant.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Protected routes (require authentication)
router.post(
  "/create",
  asyncHandler(isAuthenticated),
  upload.single("image"),
  asyncHandler(createRestaurant)
);

router.put(
  "/update",
  asyncHandler(isAuthenticated),
  upload.single("image"),
  asyncHandler(updateRestaurant)
);

// Public routes
router.get("/", asyncHandler(isAuthenticated),asyncHandler(getRestaurant)); // Changed from "/getRestaurant"
router.get("/search/:searchText", asyncHandler(searchRestaurant));
router.get("/:id", asyncHandler(getSingleRestaurant)); // Changed from "/single/:id"

// Order-related routes
router.get("/orders", asyncHandler(isAuthenticated), asyncHandler(getRestaurantOrder));
router.put("/orders/:orderId", asyncHandler(isAuthenticated), asyncHandler(updateOrderStatus));

export default router;