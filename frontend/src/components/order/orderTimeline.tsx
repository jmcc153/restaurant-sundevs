"use client";

import { TimelineEvent, EventType } from "@/types";
import {
  ShoppingCart,
  RefreshCw,
  Trash2,
  Calculator,
  Send,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { TimelineItem } from "./timeLineItem";

const EVENT_CONFIG: Record<
  EventType,
  { label: string; icon: React.ElementType; color: string }
> = {
  CART_ITEM_ADDED: {
    label: "Producto agregado",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  CART_ITEM_UPDATED: {
    label: "Producto actualizado",
    icon: RefreshCw,
    color: "bg-blue-500",
  },
  CART_ITEM_REMOVED: {
    label: "Producto eliminado",
    icon: Trash2,
    color: "bg-red-500",
  },
  PRICING_CALCULATED: {
    label: "Precio calculado",
    icon: Calculator,
    color: "bg-purple-500",
  },
  ORDER_PLACED: {
    label: "Pedido creado",
    icon: Send,
    color: "bg-primary",
  },
  ORDER_STATUS_CHANGED: {
    label: "Estado actualizado",
    icon: ArrowRightLeft,
    color: "bg-amber-500",
  },
  VALIDATION_FAILED: {
    label: "Validación fallida",
    icon: AlertTriangle,
    color: "bg-red-600",
  },
};

interface TimelineProps {
  events: TimelineEvent[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function OrderTimeline({
  events,
  hasMore,
  loading,
  onLoadMore,
}: TimelineProps) {
  if (events.length === 0 && !loading) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No hay eventos en el timeline.
      </p>
    );
  }

  return (
    <div>
      <div className="space-y-0">
        {events.map((event) => (
          <TimelineItem
            key={event.eventId}
            event={event}
            eventConfig={EVENT_CONFIG}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm font-bold text-primary hover:underline disabled:opacity-50 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {loading ? "Cargando..." : "Cargar más eventos"}
          </button>
        </div>
      )}
    </div>
  );
}
