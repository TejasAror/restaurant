import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AxiosError } from "axios";

// 1. Enhanced API Configuration with interceptors
const API_BASE_URL = "http://localhost:8000/api/v1";
const RESTAURANT_API_URL = `${API_BASE_URL}/restaurant`;

const apiClient = axios.create({
  baseURL: RESTAURANT_API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use((config) => {
  console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Type definitions
type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

type Restaurant = {
  _id: string;
  user: string;
  restaurantName: string;
  city: string;
  country: string;
  deliveryTime: number;
  cuisines: string[];
  menus: MenuItem[];
  imageUrl: string;
};

type RestaurantState = {
  loading: boolean;
  restaurant: Restaurant | null;
  searchedRestaurant: Restaurant[];
  createRestaurant: (formData: FormData) => Promise<void>;
  getRestaurant: () => Promise<void>;
  updateRestaurant: (formData: FormData) => Promise<void>;
  searchRestaurant: (
    searchText: string,
    searchQuery: string,
    selectedCuisines: string[]
  ) => Promise<void>;
  addMenuToRestaurant: (menu: MenuItem) => void;
  updateMenuToRestaurant: (updatedMenu: MenuItem) => void;
  getSingleRestaurant: (id: string) => Promise<void>;
};

const normalizeImageUpload = (formData: FormData) => {
  const image = formData.get("imageFile");
  if (image) {
    formData.delete("imageFile");
    formData.append("image", image as Blob);
  }
};

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      loading: false,
      restaurant: null,
      searchedRestaurant: [],

      // Create Restaurant - POST /api/v1/restaurant/create
      createRestaurant: async (formData) => {
        try {
          set({ loading: true });
          normalizeImageUpload(formData);

          const { data } = await apiClient.post("/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (data.success) {
            toast.success("Restaurant created successfully");
            set({ restaurant: data.restaurant });
          } else {
            toast.error(data.message || "Failed to create restaurant");
          }
        } catch (error) {
          handleApiError(error, "Failed to create restaurant");
        } finally {
          set({ loading: false });
        }
      },

      // Get Restaurant - GET /api/v1/restaurant/
      getRestaurant: async () => {
        try {
          set({ loading: true });
          const { data } = await apiClient.get("/");

          if (data.success) {
            set({ restaurant: data.restaurant });
          } else if (data.message === "Restaurant not found") {
            set({ restaurant: null });
            // No toast for expected 404 case
          }
        } catch (error) {
          if ((error as AxiosError)?.response?.status === 404) {
            set({ restaurant: null });
          } else {
            handleApiError(error, "Failed to fetch restaurant");
          }
        } finally {
          set({ loading: false });
        }
      },

      // Update Restaurant - PUT /api/v1/restaurant/update
      updateRestaurant: async (formData) => {
        try {
          set({ loading: true });
          normalizeImageUpload(formData);

          const { data } = await apiClient.put("/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (data.success) {
            toast.success("Restaurant updated successfully");
            set({ restaurant: data.restaurant });
          }
        } catch (error) {
          handleApiError(error, "Failed to update restaurant");
        } finally {
          set({ loading: false });
        }
      },

      // Search Restaurant - GET /api/v1/restaurant/search/:searchText
      searchRestaurant: async (searchText, searchQuery, selectedCuisines) => {
        try {
          set({ loading: true });
          const params = new URLSearchParams({
            searchQuery,
            selectedCuisines: selectedCuisines.join(","),
          });
          const path = searchText || "all";

          const { data } = await apiClient.get(`/search/${path}?${params.toString()}`);
          set({ searchedRestaurant: data.data || [] });
        } catch (error) {
          handleApiError(error, "Search failed");
          set({ searchedRestaurant: [] });
        } finally {
          set({ loading: false });
        }
      },

      // Get Single Restaurant - GET /api/v1/restaurant/:id
      getSingleRestaurant: async (id) => {
        try {
          set({ loading: true });
          const { data } = await apiClient.get(`/${id}`);

          if (data.success) {
            set({ restaurant: data.restaurant });
          }
        } catch (error) {
          handleApiError(error, "Failed to fetch restaurant details");
        } finally {
          set({ loading: false });
        }
      },

      // Local state updates
      addMenuToRestaurant: (menu) => {
        set((state) => ({
          restaurant: state.restaurant
            ? {
                ...state.restaurant,
                menus: [...state.restaurant.menus, menu],
              }
            : null,
        }));
      },

      updateMenuToRestaurant: (updatedMenu) => {
        set((state) => {
          if (!state.restaurant) return state;
          return {
            restaurant: {
              ...state.restaurant,
              menus: state.restaurant.menus.map((menu) =>
                menu._id === updatedMenu._id ? updatedMenu : menu
              ),
            },
          };
        });
      },
    }),
    {
      name: "restaurant-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurant: state.restaurant,
      }),
    }
  )
);

// Enhanced error handler
function handleApiError(error: unknown, defaultMessage: string) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      toast.error("Session expired. Please login again.");
      // Add redirect logic if needed
    } else if (status === 404) {
      // Silent handling for expected 404 cases
      console.log("Resource not found (expected):", error.config?.url);
    } else {
      toast.error(serverMessage || defaultMessage);
    }

    console.error("API Error Details:", {
      url: error.config?.url,
      status,
      data: error.response?.data,
    });
  } else {
    toast.error(defaultMessage);
    console.error("Non-API Error:", error);
  }
}