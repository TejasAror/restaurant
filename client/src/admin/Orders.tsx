import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useEffect, useState } from "react";

const Orders = () => {
  const { restaurantOrder, getRestaurantOrders, updateRestaurantOrder } =
    useRestaurantStore();
  const [loading, setLoading] = useState(false); // Track loading state

  // Function to handle status change
  const handleStatusChange = async (id: string, status: string) => {
    setLoading(true); // Start loading state
    try {
      await updateRestaurantOrder(id, status); // Call API to update the order status
      getRestaurantOrders(); // Fetch updated orders
    } catch (error) {
      console.error("Error updating order status", error);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  useEffect(() => {
    getRestaurantOrders(); // Fetch orders when component mounts
  }, [getRestaurantOrders]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Orders Overview
      </h1>
      <div className="space-y-8">
        {/* Displaying Restaurant Orders */}
        {restaurantOrder.map((order) => (
          <div
            key={order._id} // Added key for better optimization
            className="flex flex-col md:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1 mb-6 sm:mb-0">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {order.deliveryDetails.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-semibold">Address: </span>
                {order.deliveryDetails.address}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-semibold">Total Amount: </span>
                {order.totalAmount / 100}
              </p>
            </div>
            <div className="w-full sm:w-1/3">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Status
              </Label>
              <Select
                onValueChange={(newStatus) =>
                  handleStatusChange(order._id, newStatus)
                }
                value={order.status} // Binding current status value to Select
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[
                      "Pending",
                      "Confirmed",
                      "Preparing",
                      "OutForDelivery",
                      "Delivered",
                    ].map((status, index) => (
                      <SelectItem key={index} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50 flex justify-center items-center">
          <span className="text-white">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default Orders;
