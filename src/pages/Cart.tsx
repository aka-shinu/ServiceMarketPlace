import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import toast from "react-hot-toast";
import { supabase, formatINR } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
const apiEndpoint = "https://api.lethrach.me/";
function generateRandom10DigitNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

const fetchApiData = (method: string, path: string, others = {}) => {
  var config = {
    method: method,
    url: apiEndpoint + path,
  };
  Object.assign(config, others);
  return axios(config);
};

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const fetchTotal = () => {
    setTotal(
      JSON.parse(localStorage.getItem("cart")).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    );
  };
  const [cpn, setCpn] = useState("");
  const handle_cpn = async (couponCode: string, inputAmount: number) => {
    console.log(user, items);
    const { data: coupon, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("code", couponCode)
      .single();

    if (error || !coupon) {
      return { error: "Invalid coupon" };
    } else {
      const now = new Date();
      const expiry = new Date(coupon.expires_at);

      // Check if coupon is expired
      if (now > expiry) {
        return { error: "Coupon expired" };
      }
      // Check if max uses reached
      else if (coupon.current_uses >= coupon.max_uses) {
        return { error: "Coupon usage limit reached" };
      } else {
        // Apply discount
        const discount = (inputAmount * coupon.discount_percentage) / 100;
        const finalAmount = inputAmount - discount;

        console.log(error, coupon.id);
        return { success: { discount: discount, finalAmount: finalAmount } };
      }
    }
  };
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    try {
      fetchApiData("post", "create_payment", {
        data: {
          user_id: user.id,
          customer_name: user.email,
          cpn: cpn,
          customer_email: user.email,
          customer_mobile: generateRandom10DigitNumber(),
          data: {
            cart: items,
          },
        },
      }).then((v) => {
        v = v.data;
        if (v.status == 200) {
          window.open(
            v.url,
            '_blank' // <- This is what makes it open in a new window.
          );
        } else {
          console.log(v);
          toast.error(v.error.message);
        }
      });
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error("Failed to place order: " + error.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Start adding some items to your cart
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  async function getStock(serviceId: string){
    try {
      const { data, error } = await supabase
      .from("service_credentials")
      .select("*")
      .eq("id", serviceId)
        .eq('is_used', false)
      if (error) throw error;
      return data.length
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      
    }

  }
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center py-6 border-b border-gray-200 last:border-0 animate-slideIn"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatINR(item.price)} per unit
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      placeholder="Quantity"
                      defaultValue={item.quantity}
                      onChange={async (e) => {
                        const quantity = item.quantity;
                        var ok = (await fetchApiData("get","getStockCount", {params: {orderId: item.id}})).data.count
                        console.log(ok,item.id)
                        if (Number(e.target.value) > ok) {
                          toast.error('Not enough stock available');
                          return;
                        }
                        updateQuantity(item.id, e.target.value);
                        
                        fetchTotal();
                      }}
                      className="p-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                    ></input>
                  </div>
                  <span className="text-lg font-medium">
                    {formatINR(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="w-full pt-6 flex whitespace-nowrap space-x-4 text-xl">
              <div className="font-bold  items-center flex">Apply code</div>
              <label htmlFor="email" className="sr-only">
                Enter code
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter code"
                // value={email}
                onChange={async (e) => {
                  var r;

                  setCpn(e.target.value);
                  setMsg(
                    ((r = await handle_cpn(e.target.value, total)),
                    r?.error ??
                      (console.log(r),
                      setTotal(r.success.finalAmount),
                      "Discount applied " + formatINR(r.success.discount)))
                  );
                  if (r?.error) {
                    setTotal(
                      items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    );
                  }
                }}
              />
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div className="w-full flex flex-col space-y-2">
                <span className="text-2xl font-bold">
                  Total: {formatINR(total)}
                </span>
                <span className="text-[90%] font-medium">{msg}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
