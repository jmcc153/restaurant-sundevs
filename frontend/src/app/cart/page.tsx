"use client";
import { CartItem } from "@/components/cart/cartItem";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CartItemType } from "@/types";
import { ModifierModal } from "@/components/menu/modifierModal";
import { useCheckoutStore } from "@/store/useOrderStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const [editItem, setEditItem] = useState<CartItemType | null>(null);
  const { items } = useCartStore();
  const { processOrder, isProcessing } = useCheckoutStore();
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.08);
  const serviceFee = items.length > 0 ? 200 : 0;
  const total = subtotal + tax + serviceFee;

  const handleEdit = (item: CartItemType) => {
    setEditItem(item);
  };

  const handleCheckout = async () => {
    const orderId = await processOrder();
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  return (
    <main
      aria-label="Carrito de compras"
      className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[80vh] flex flex-col"
    >
      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <section
              aria-label="Artículos en el carrito"
              className="lg:col-span-8 space-y-4"
            >
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="relative group animate-in fade-in slide-in-from-left-4 duration-300"
                >
                  <CartItem item={item} onEdit={handleEdit} />
                </div>
              ))}
            </section>

            <aside
              aria-label="Resumen del pedido"
              className="lg:col-span-4 lg:sticky lg:top-24"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/60 space-y-6">
                <h2
                  aria-label="Resumen de pago"
                  className="font-extrabold text-xl text-slate-900"
                >
                  Resumen de pago
                </h2>
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Impuestos (8%)</span>
                    <span className="text-slate-900 font-bold">
                      {formatPrice(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tarifa de servicio</span>
                    <span className="text-slate-900 font-bold">
                      {formatPrice(serviceFee)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-end pt-2">
                    <div className="grid">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Total a pagar
                      </span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  aria-busy={isProcessing}
                  className="w-full h-16 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isProcessing ? "Procesando..." : "Continuar al Checkout"}
                </Button>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div
          role="status"
          aria-label="Carrito vacío"
          className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500"
        >
          <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center max-w-md w-full">
            <div className="bg-white p-6 rounded-full shadow-inner mb-6">
              <ShoppingBag
                className="text-slate-300"
                size={48}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-slate-500 text-center text-sm font-medium mb-8">
              Parece que aún no has añadido nada delicioso a tu pedido.
            </p>
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="rounded-xl font-bold px-8 h-12 border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
              >
                Volver al Menú
              </Button>
            </Link>
          </div>
        </div>
      )}
      {editItem && (
        <ModifierModal
          key={editItem.cartItemId}
          open={!!editItem}
          onOpenChange={() => setEditItem(null)}
          product={editItem}
          quantity={editItem.quantity}
          editItem={editItem}
        />
      )}
    </main>
  );
}
