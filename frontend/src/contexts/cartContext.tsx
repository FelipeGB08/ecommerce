import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GetUserCartConnection } from '../connections/productConnection';

interface CartContextType {
  cartItemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCart = async () => {
    try {
      const res = await GetUserCartConnection({ body: {} });
      if (res && res.ok) {
        const cartItems = res.msg || [];
        // Calcular quantidade total somando as quantidades de cada item
        const totalQuantity = cartItems.reduce((acc: number, item: any) => {
          return acc + (item.quantity || 1);
        }, 0);
        setCartItemCount(totalQuantity);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      setCartItemCount(0);
    }
  };

  // Carregar quantidade inicial ao montar o componente
  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartItemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
