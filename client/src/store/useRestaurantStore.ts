import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_BASE_URL = "http://localhost:8000/api/v1";
const RESTAURANT_API_URL = `${API_BASE_URL}/restaurant`;

const apiClient = axios.create({
  baseURL: RESTAURANT_API_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

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

// ---------- Types ----------
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
  getSingleRestaurant: (id: string) => Promise<void>;
  addMenuToRestaurant: (menu: MenuItem) => void;
  updateMenuToRestaurant: (updatedMenu: MenuItem) => void;
};

// ---------- Helpers ----------
const normalizeImageUpload = (formData: FormData) => {
  const image = formData.get("imageFile");
  if (image) {
    formData.delete("imageFile");
    formData.append("image", image as Blob);
  }
};

const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      toast.error("Session expired. Please login again.");
    } else if (status === 404) {
      console.warn("Resource not found:", error.config?.url);
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
};

// ---------- Zustand Store ----------
export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      loading: false,
      restaurant: null,
      searchedRestaurant: [],

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

      getRestaurant: async () => {
        try {
          set({ loading: true });
          const { data } = await apiClient.get("/");

          if (data.success) {
            set({ restaurant: data.restaurant });
          } else if (data.message === "Restaurant not found") {
            set({ restaurant: null });
          }
        } catch (error) {
          if ((error as AxiosError).response?.status === 404) {
            set({ restaurant: null });
          } else {
            handleApiError(error, "Failed to fetch restaurant");
          }
        } finally {
          set({ loading: false });
        }
      },

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

      getSingleRestaurant: async (id: string) => {
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

      addMenuToRestaurant: (menu: MenuItem) => {
        set((state) => ({
          restaurant: state.restaurant
            ? {
                ...state.restaurant,
                menus: [...state.restaurant.menus, menu],
              }
            : null,
        }));
      },

      updateMenuToRestaurant: (updatedMenu: MenuItem) => {
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
      partialize: (state) => ({ restaurant: state.restaurant }),
    }
  )
);
