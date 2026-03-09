"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-10 max-w-md w-full space-y-4">
        <AlertTriangle className="mx-auto text-red-400" size={40} />
        <h2 className="text-lg font-bold text-slate-900">
          Error al cargar la orden
        </h2>
        <p className="text-sm text-slate-500">
          {error.message ||
            "No pudimos cargar los detalles de la orden. Verifica el ID e intenta de nuevo."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw size={14} />
            Reintentar
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Volver al menú</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
