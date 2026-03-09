import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useParams: () => ({ orderId: "order-abc-123" }),
}));

vi.mock("@/services/order", () => ({
  orderService: {
    getOrder: vi.fn(),
    getTimeline: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  formatPrice: (p: number) => `$${p}`,
}));

vi.mock("@/components/order/orderStepper", () => ({
  OrderStepper: ({ status }: { status: string }) => (
    <div data-testid="order-stepper">{status}</div>
  ),
}));

vi.mock("@/components/order/orderTimeline", () => ({
  OrderTimeline: () => <div data-testid="order-timeline" />,
}));

vi.mock("@/components/order/orderStatusBadge", () => ({
  OrderStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

import { orderService } from "@/services/order";
import OrderPage from "../app/orders/[orderId]/page";

const mockOrder = {
  orderId: "order-abc-123",
  userId: "user-1",
  status: "PENDING",
  total: 3000,
  createdAt: new Date().toISOString(),
  items: [
    {
      cartItemId: "c1",
      name: "Pizza",
      quantity: 2,
      subtotal: 2000,
      unitPrice: 1000,
      modifiers: [],
    },
  ],
};

describe("OrderPage", () => {
  beforeEach(() => {
    vi.mocked(orderService.getOrder).mockResolvedValue(mockOrder as any);
    vi.mocked(orderService.getTimeline).mockResolvedValue({
      events: [],
      totalPages: 1,
    } as any);
  });

  it("muestra loader al inicio", () => {
    render(<OrderPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("muestra el id de la orden", async () => {
    render(<OrderPage />);
    await waitFor(() =>
      expect(screen.getByText(/order-abc-123/i)).toBeInTheDocument(),
    );
  });

  it("muestra el total de la orden", async () => {
    render(<OrderPage />);
    await waitFor(() => expect(screen.getByText("$3000")).toBeInTheDocument());
  });

  it("muestra el stepper con el status", async () => {
    render(<OrderPage />);
    await waitFor(() =>
      expect(screen.getByTestId("order-stepper")).toHaveTextContent("PENDING"),
    );
  });

  it("muestra error cuando falla la carga", async () => {
    vi.mocked(orderService.getOrder).mockRejectedValue(
      new Error("Error de red"),
    );
    render(<OrderPage />);
    await waitFor(() =>
      expect(screen.getByText(/error de red/i)).toBeInTheDocument(),
    );
  });

  it("renderiza los items del pedido", async () => {
    render(<OrderPage />);
    await waitFor(() => expect(screen.getByText(/pizza/i)).toBeInTheDocument());
  });
});
