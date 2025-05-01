import { CheckoutSessionRequest, OrderState } from "@/types/orderType";
import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_END_POINT = "http://localhost:8000/api/v1/order";
axios.defaults.withCredentials = true;

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      loading: false,
      orders: [],
      
      // Create Checkout Session
      createCheckoutSession: async (checkoutSession: CheckoutSessionRequest) => {
        set({ loading: true }); // Setting loading state to true before the request
        try {
          const response = await axios.post(
            `${API_END_POINT}/checkout/create-checkout-session`,
            checkoutSession,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const sessionUrl = response?.data?.session?.url;
          if (sessionUrl) {
            window.location.href = sessionUrl; // Redirect to the checkout page
          } else {
            console.error("Checkout session URL not found");
          }
        } catch (error) {
          console.error("Error creating checkout session:", error);
        } finally {
          set({ loading: false }); // Reset the loading state after the request is complete
        }
      },

      // Fetch Order Details
      getOrderDetails: async () => {
        set({ loading: true }); // Set loading to true before fetching the orders
        try {
          const response = await axios.get(`${API_END_POINT}/`);
          set({ orders: response.data.orders || [] }); // Set orders after fetching
        } catch (error) {
          console.error("Error fetching order details:", error);
        } finally {
          set({ loading: false }); // Reset the loading state after fetching orders
        }
      },
      
      // Optional: Clear orders or reset state
      clearOrders: () => set({ orders: [] }),

    }),
    {
      name: "order-name", // Store name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
