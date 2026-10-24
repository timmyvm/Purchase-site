"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import type { CartItem } from "@/app/lib/types";

type CartContextValue = {
  items: CartItem[];
  /** False until the stored cart has been read from localStorage. */
  hydrated: boolean;
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  itemCount: number;
  openCart: () => void;
  registerOpenCart: (fn: () => void) => void;
};

type CartProviderProps = {
  children: React.ReactNode;
  storageKey: string;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const isSameItem = (item: CartItem, productId: string, variantId: string) =>
  item.productId === productId && item.variantId === variantId;

export const CartProvider = ({ children, storageKey }: CartProviderProps) => {
  const [items, setItems, hydrated] = useLocalStorage<CartItem[]>(storageKey, []);
  const openCartRef = useRef<(() => void) | null>(null);

  const registerOpenCart = useCallback((fn: () => void) => {
    openCartRef.current = fn;
  }, []);

  const openCart = useCallback(() => {
    openCartRef.current?.();
  }, []);

  const addItem = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => isSameItem(item, productId, variantId));
        if (existing) {
          return current.map((item) =>
            isSameItem(item, productId, variantId)
              ? { ...item, quantity: Math.min(MAX_QUANTITY_PER_ITEM, item.quantity + quantity) }
              : item
          );
        }
        return [
          ...current,
          { productId, variantId, quantity: Math.min(MAX_QUANTITY_PER_ITEM, quantity) },
        ];
      });
      openCartRef.current?.();
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      const nextQuantity = Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(quantity));
      if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
        return;
      }
      setItems((current) =>
        current.map((item) =>
          isSameItem(item, productId, variantId) ? { ...item, quantity: nextQuantity } : item
        )
      );
    },
    [setItems]
  );

  const removeItem = useCallback(
    (productId: string, variantId: string) => {
      setItems((current) => current.filter((item) => !isSameItem(item, productId, variantId)));
    },
    [setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount,
      openCart,
      registerOpenCart,
    }),
    [items, hydrated, addItem, updateQuantity, removeItem, clearCart, itemCount, openCart, registerOpenCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
