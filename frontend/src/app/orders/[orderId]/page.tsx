"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/services/order";
import { Order } from "@/types/order";
import { TimelineEvent } from "@/types/event";
import { formatPrice } from "@/lib/utils";
import { OrderStepper } from "@/components/order/orderStepper";
import { OrderTimeline } from "@/components/order/orderTimeline";
import { OrderStatusBadge } from "@/components/order/orderStatusBadge";
import { Loader2 } from "lucide-react";

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const init = async () => {
      setLoading(true);
      try {
        const [orderData, timelineData] = await Promise.all([
          orderService.getOrder(orderId),
          orderService.getTimeline(orderId, 1),
        ]);
        setOrder(orderData);
        setEvents(timelineData.events);
        setTotalPages(timelineData.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderId]);

  const handleLoadMore = async () => {
    if (!orderId) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const timelineData = await orderService.getTimeline(orderId, next);
      setEvents((prev) => {
        const existingIds = new Set(prev.map((e) => e.eventId));
        const newEvents = timelineData.events.filter(
          (e) => !existingIds.has(e.eventId),
        );
        return [...prev, ...newEvents];
      });
      setTotalPages(timelineData.totalPages);
      setPage(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-bold">
            {error ?? "Orden no encontrada"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <OrderStepper status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Order details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900">
                Orden #{order.orderId.slice(0, 8)}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Usuario</span>
                <span className="font-semibold text-slate-800 font-mono text-xs">
                  {order.userId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-black text-slate-900">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Creada</span>
                <span className="font-medium text-slate-700 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Items ({order.items.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {item.name}{" "}
                      <span className="text-slate-400 font-normal">
                        x{item.quantity}
                      </span>
                    </p>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.modifiers
                          .map(
                            (m) =>
                              `${m.optionName}${m.extraPrice > 0 ? ` (+${formatPrice(m.extraPrice)})` : ""}`,
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">
                      {formatPrice(item.subtotal)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatPrice(item.unitPrice)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Timeline
            </h2>
            <div className="overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
              <OrderTimeline
                events={events}
                hasMore={page < totalPages}
                loading={loadingMore}
                onLoadMore={handleLoadMore}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
