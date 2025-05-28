import create from "zustand";

interface Order {
  _id: string;
  deliveryDetails: {
    name: string;
    address: string;
  };
  totalAmount: number;
  status: string;
}

interface RestaurantState {
  restaurantOrder: Order[];
  getRestaurantOrders: () => Promise<void>;
  updateRestaurantOrder: (id: string, status: string) => Promise<void>;
  // other state props and methods...
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurantOrder: [],

  getRestaurantOrders: async () => {
    try {
      // Replace with your real API call
      const response = await fetch("/api/orders"); 
      const data: Order[] = await response.json();

      set({ restaurantOrder: data });
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  },

  updateRestaurantOrder: async (id, status) => {
    try {
      // Replace with your real API call
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      // Optionally update local state immediately
      const updatedOrders = get().restaurantOrder.map((order) =>
        order._id === id ? { ...order, status } : order
      );
      set({ restaurantOrder: updatedOrders });
    } catch (error) {
      console.error("Failed to update order", error);
      throw error; // so component can handle error if needed
    }
  },
}));
