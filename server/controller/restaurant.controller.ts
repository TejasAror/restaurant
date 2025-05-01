import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model.js";
import { Multer } from "multer";
import uploadImageOnCloudinary from "../utils/imageUpload.js";
import { Order } from "../models/order.model.js";


export const createRestaurant = async (req: Request, res: Response) => {
    try {
      const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
      const file = req.file;
  
      console.log("User ID:", req.id);
      console.log("Request Body:", req.body);
      console.log("File Info:", file);
  
      // Check if restaurant already exists for the user
      const existingRestaurant = await Restaurant.findOne({ user: req.id });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: "Restaurant already exists for this user",
        });
      }
  
      // Check if image was uploaded
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }
  
      // Parse cuisines safely
      let parsedCuisines: string[];
      try {
        parsedCuisines = JSON.parse(cuisines);
        if (!Array.isArray(parsedCuisines)) {
          throw new Error("Cuisines must be an array");
        }
      } catch (parseError) {
        console.error("Cuisines parse error:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid cuisines format",
        });
      }
  
      // Upload image to Cloudinary
      let imageUrl: string;
      try {
        imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
  
      // Create restaurant entry
      const newRestaurant = await Restaurant.create({
        user: req.id,
        restaurantName,
        city,
        country,
        deliveryTime,
        cuisines: parsedCuisines,
        imageUrl,
      });
  
      return res.status(201).json({
        success: true,
        message: "Restaurant added successfully",
        restaurant: newRestaurant,
      });
    } catch (error: any) {
      console.error("Create restaurant error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };
  

export const getRestaurant = async (req: Request, res: Response) => {
    try {
        // console.log("User ID:", req.id);
        
        const restaurant = await Restaurant.findOne({ user: req.id }).populate('menus');
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                restaurant: [],
                message: "Restaurant not found"
            });
        }
        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;

        const restaurant = await Restaurant.findOne({ user: req.id });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        restaurant.restaurantName = restaurantName;
        restaurant.city = city;
        restaurant.country = country;
        restaurant.deliveryTime = deliveryTime;
        restaurant.cuisines = JSON.parse(cuisines);

        if (file) {
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();
        return res.status(200).json({
            success: true,
            message: "Restaurant updated",
            restaurant
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRestaurantOrder = async (req: Request, res: Response) => {
    try {
        const restaurant = (await Restaurant.findOne({ user: req.id })).populated('menus');
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                restaurant:[],
                message: "Restaurant not found"
            });
        }

        const orders = await Order.find({ restaurant: restaurant._id }).populate('restaurant').populate('user');
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            status: order.status,
            message: "Status updated"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const searchText = req.params.searchText || "";
        const searchQuery = req.query.searchQuery as string || "";
        const selectedCuisines = (req.query.selectedCuisines as string || "").split(",").filter(cuisine => cuisine);
        const query: any = {};

        if (searchText) {
            query.$or = [
                { restaurantName: { $regex: searchText, $options: 'i' } },
                { city: { $regex: searchText, $options: 'i' } },
                { country: { $regex: searchText, $options: 'i' } },
            ];
        }

        if (searchQuery) {
            query.$or = [
                { restaurantName: { $regex: searchQuery, $options: 'i' } },
                { cuisines: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        if (selectedCuisines.length > 0) {
            query.cuisines = { $in: selectedCuisines };
        }

        const restaurants = await Restaurant.find(query);
        return res.status(200).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSingleRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path: 'menus',
            options: { createdAt: -1 }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
