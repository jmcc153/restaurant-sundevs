"use client";

import { AlertTriangle, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-10 max-w-md w-full space-y-4">
        <ShoppingBag className="mx-auto text-red-400" size={40} />
        <h2 className="text-lg font-bold text-slate-900">
          Error al cargar el carrito
        </h2>
        <p className="text-sm text-slate-500">
          {error.message || "No pudimos cargar tu carrito. Intenta de nuevo."}
        </p>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RotateCcw size={14} />
          Reintentar
        </Button>
      </div>
    </main>
  );
}
