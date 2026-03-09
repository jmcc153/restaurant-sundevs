"use client";

import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] =
  [
    { status: "PENDING", label: "Pendiente", icon: Clock },
    { status: "CONFIRMED", label: "Confirmado", icon: CheckCircle2 },
    { status: "PREPARING", label: "Preparando", icon: ChefHat },
    { status: "READY", label: "Listo", icon: PackageCheck },
    { status: "DELIVERED", label: "Entregado", icon: Truck },
  ];

const STATUS_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

export function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-center gap-3 py-6 px-4 bg-red-50 rounded-2xl border border-red-100">
        <XCircle className="text-red-500" size={24} />
        <span className="font-bold text-red-700">Orden cancelada</span>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[status];

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div
            key={step.status}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isDone &&
                    "bg-green-500 text-white shadow-lg shadow-green-200",
                  isCurrent &&
                    "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10 animate-pulse",
                  !isDone && !isCurrent && "bg-slate-100 text-slate-400",
                )}
              >
                <Icon size={18} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold text-center leading-tight",
                  isDone && "text-green-600",
                  isCurrent && "text-primary",
                  !isDone && !isCurrent && "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i < currentIndex ? "bg-green-400" : "bg-slate-200",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
