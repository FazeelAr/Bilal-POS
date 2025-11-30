import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";
import CartContext from "./CartContext";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const navigate = useNavigate();

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find(
        (i) => i.productPriceId === product.productPriceId
      );
      if (found) {
        return prev.map((i) =>
          i.productPriceId === product.productPriceId
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productPriceId: product.productPriceId,
          productId: product.productId,
          name: product.name,
          price: product.price,
          qty: 1,
          factor: 1,
        },
      ];
    });
  };

  const updateQuantity = (productPriceId, qty) => {
    const q = Number(qty);
    setCart((c) =>
      c.map((it) =>
        it.productPriceId === productPriceId ? { ...it, qty: q } : it
      )
    );
  };

  const updateFactor = (productPriceId, factor) => {
    const f = Number(factor);
    setCart((c) =>
      c.map((it) =>
        it.productPriceId === productPriceId ? { ...it, factor: f } : it
      )
    );
  };

  const removeFromCart = (productPriceId) =>
    setCart((c) => c.filter((it) => it.productPriceId !== productPriceId));

  const clearCart = () => setCart([]);

  const clearCustomer = () => setCurrentCustomer(null);

  const itemTotal = (it) =>
    (Number(it.price) || 0) * (Number(it.qty) || 0) * (Number(it.factor) || 1);

  const grandTotal = cart.reduce((s, it) => s + itemTotal(it), 0);

  const isCheckoutDisabled = () => {
    if (!cart || cart.length === 0) return true;
    if (!currentCustomer) return true;
    return cart.some((item) => {
      const quantity = Number(item.qty);
      const factor = Number(item.factor);
      return !quantity || quantity <= 0 || !factor || factor <= 0;
    });
  };

  const handleCheckout = async () => {
    if (isCheckoutDisabled()) {
      if (!currentCustomer) {
        alert("Please select a customer before checkout");
      } else {
        alert("Cannot checkout: fix invalid items");
      }
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const items = cart.map((it) => ({
      product: it.productId,
      quantity: Number(it.qty),
      factor: Number(it.factor) || 1,
      price: (Number(it.price) || 0) * (Number(it.factor) || 1),
    }));

    const payload = {
      items,
      customer: currentCustomer.id,
    };

    let backendOrder = null;

    try {
      const res = await apiPost("sales/orders/create/", payload);
      backendOrder = res.data;
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Checkout failed – but showing receipt anyway.");
    }

    const itemsPayload = cart.map((it) => {
      const qty = Number(it.qty) || 0;
      const factor = Number(it.factor) || 1;
      const price = Number(it.price) || 0;
      const lineTotal = price * qty * factor;
      return {
        productPriceId: it.productPriceId,
        productId: it.productId,
        name: it.name,
        qty,
        factor,
        price,
        lineTotal,
      };
    });

    const receiptPayload = {
      items: itemsPayload,
      total: grandTotal,
      createdAt: new Date().toISOString(),
      customer: currentCustomer,
    };

    navigate("/receipt", {
      state: {
        payload: receiptPayload,
        response: backendOrder,
      },
    });

    clearCart();
    clearCustomer();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        currentCustomer,
        setCurrentCustomer,
        clearCustomer,
        addToCart,
        updateQuantity,
        updateFactor,
        removeFromCart,
        clearCart,
        itemTotal,
        grandTotal,
        isCheckoutDisabled,
        handleCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
