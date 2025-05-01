import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const set_ = (item: object)=> {return console.log(item),localStorage.setItem("cart",JSON.stringify(item)),item}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: JSON.parse(localStorage.getItem("cart") ?? "[]"),
  addItem: (item) =>
    console.log(set(((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        var r = {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      else{
       var r = { items: [...state.items, item] }
      }
      set_(r.items)
      return r ;
    }))),
  removeItem: (id) =>
    set(((state) => {

      var r = {
      items: state.items.filter((item) => item.id !== id),
    }
    set_(r.items)
    return r
  })),
  updateQuantity: (id, quantity) =>
    set(((state) => {
      var r = {

      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }
    set_(r.items)
    return r 
  })),
  clearCart: () => {
    localStorage.setItem("cart", "[]");
    set({ items: [] });
  },
}));