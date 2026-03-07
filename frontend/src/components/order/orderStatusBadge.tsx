"use client";

import { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  PREPARING: { label: "Preparando", variant: "default" },
  READY: { label: "Listo", variant: "outline" },
  DELIVERED: { label: "Entregado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_MAP[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
