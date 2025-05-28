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
import { useEffect, useRef, useState } from "react";

interface Order {
  _id: string;
  deliveryDetails: {
    name: string;
    address: string;
  };
  totalAmount: number;
  status: string;
}

const Orders = () => {
  const { restaurantOrder, getRestaurantOrders, updateRestaurantOrder } =
    useRestaurantStore();

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingOrderId(id);
    try {
      await updateRestaurantOrder(id, status);
      await getRestaurantOrders(); // refresh orders after update
    } catch (error) {
      console.error("Error updating order status", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      getRestaurantOrders();
      hasFetchedRef.current = true;
    }
  }, [getRestaurantOrders]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Orders Overview
      </h1>
      <div className="space-y-8">
        {restaurantOrder.map((order: Order) => (
          <div
            key={order._id}
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
                {(order.totalAmount / 100).toFixed(2)}
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
                value={order.status}
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
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {updatingOrderId === order._id && (
                <p className="text-sm text-blue-500 mt-2">Updating...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
