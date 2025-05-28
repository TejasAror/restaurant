import { Minus, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useState } from "react";
import CheckoutConfirmPage from "./CheckoutConfirmPage";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cartType";

const Cart = () => {
  const [open, setOpen] = useState(false);
  const {
    cart,
    decrementQuantity,
    incrementQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col max-w-7xl mx-auto my-10 px-4">
      <div className="flex justify-end mb-4">
        {cart.length > 0 && (
          <Button variant="link" onClick={clearCart} aria-label="Clear all items">
            Clear All
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Items</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Remove</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {cart.map((item: CartItem) => (
            <TableRow key={item._id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={item.image} alt={item.name} />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell>
                <div className="flex items-center rounded-full border border-gray-100 dark:border-gray-800 shadow-md w-fit">
                  <Button
                    onClick={() => decrementQuantity(item._id)}
                    size="icon"
                    variant="outline"
                    className="rounded-full bg-gray-200"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled
                    className="font-bold border-none pointer-events-none"
                    aria-label={`Quantity of ${item.name}`}
                  >
                    {item.quantity}
                  </Button>
                  <Button
                    onClick={() => incrementQuantity(item._id)}
                    size="icon"
                    variant="outline"
                    className="rounded-full bg-orange-500 hover:bg-hoverOrange"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus />
                  </Button>
                </div>
              </TableCell>
              <TableCell>₹{item.price * item.quantity}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFromCart(item._id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow className="text-xl font-bold">
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right">₹{totalAmount}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {cart.length > 0 && (
        <div className="flex justify-end my-5">
          <Button
            onClick={() => setOpen(true)}
            className="bg-orange-500 hover:bg-hoverOrange"
            aria-label="Proceed to checkout"
          >
            Proceed To Checkout
          </Button>
        </div>
      )}

      <CheckoutConfirmPage open={open} setOpen={setOpen} />
    </div>
  );
};

export default Cart;
