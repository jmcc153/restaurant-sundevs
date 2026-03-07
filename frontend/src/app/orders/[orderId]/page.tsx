"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/services/order";
import { Order } from "@/types/order";
import { TimelineEvent } from "@/types/event";
import { formatPrice } from "@/lib/utils";

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [orderData, timelineData] = await Promise.all([
          orderService.getOrder(orderId),
          orderService.getTimeline(orderId),
        ]);
        setOrder(orderData);
        setEvents(timelineData.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-slate-500">Cargando orden...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-500">{error ?? "Orden no encontrada"}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Order Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900">
            Orden #{order.orderId.slice(0, 8)}
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {order.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Usuario:</span>{" "}
            {order.userId}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Total:</span>{" "}
            {formatPrice(order.total)}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Creada:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold text-slate-700">
              Idempotency Key:
            </span>{" "}
            <span className="font-mono text-xs">
              {order.idempotencyKey.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div
              key={item.cartItemId}
              className="py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">
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
                <p className="font-bold text-slate-900">
                  {formatPrice(item.subtotal)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatPrice(item.unitPrice)} c/u
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline / Events */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Timeline ({events.length} eventos)
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No hay eventos registrados.</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.eventId}
                className="border border-slate-100 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">
                    {evt.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>
                    source: <strong>{evt.source}</strong>
                  </span>
                  <span>
                    correlationId:{" "}
                    <span className="font-mono">
                      {evt.correlationId.slice(0, 8)}...
                    </span>
                  </span>
                </div>
                <pre className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 overflow-x-auto">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
