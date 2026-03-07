"use client";

import { TimelineEvent, EventType } from "@/types";
import { useState } from "react";
import {
  ShoppingCart,
  RefreshCw,
  Trash2,
  Calculator,
  Send,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";

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

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0 group">
      <div className="absolute left-3.75 top-8 bottom-0 w-0.5 bg-slate-200 group-last:hidden" />

      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${config.color}`}
      >
        <Icon size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-900">
              {config.label}
            </span>
            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fuente: {event.source} &middot; {event.eventId.slice(0, 8)}...
          </p>
        </button>

        {expanded && (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="grid gap-1 text-slate-600">
              <div>
                <span className="font-semibold">Event ID:</span> {event.eventId}
              </div>
              <div>
                <span className="font-semibold">Correlation ID:</span>{" "}
                {event.correlationId}
              </div>
              <div>
                <span className="font-semibold">User ID:</span> {event.userId}
              </div>
            </div>
            {Object.keys(event.payload).length > 0 && (
              <pre className="mt-2 p-2 bg-white rounded-lg border text-[10px] overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
          <TimelineItem key={event.eventId} event={event} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar más eventos"}
          </button>
        </div>
      )}
    </div>
  );
}
