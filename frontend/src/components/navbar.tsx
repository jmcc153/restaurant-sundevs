"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";

export const Navbar = () => {
  const { items, fetchCart } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav
        aria-label="Navegación principal"
        className="container mx-auto flex h-16 items-center justify-between px-4"
      >
        <Link
          href="/"
          aria-label="Ir al inicio - Mi restaurante"
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold text-foreground">
            Mi restaurante
          </span>
        </Link>

        <Link
          href="/cart"
          aria-label={`Ir al carrito${itemCount > 0 ? `, ${itemCount} artículos` : ""}`}
        >
          <Button variant="outline" className="relative gap-2">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <>
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                >
                  {itemCount}
                </span>
              </>
            )}
          </Button>
        </Link>
      </nav>
    </header>
  );
};
