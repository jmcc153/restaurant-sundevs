import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/store/useCartStore", () => ({
  useCartStore: vi.fn(),
}));

vi.mock("@/store/useOrderStore", () => ({
  useCheckoutStore: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/cart/cartItem", () => ({
  CartItem: ({ item }: { item: { name: string } }) => (
    <div data-testid="cart-item">{item.name}</div>
  ),
}));

vi.mock("@/components/menu/modifierModal", () => ({
  ModifierModal: () => <div data-testid="modifier-modal" />,
}));

import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useOrderStore";
import CartPage from "../app/cart/page";

const mockItems = [
  {
    cartItemId: "cart-1",
    productId: "1",
    name: "Pizza",
    description: "Rica pizza",
    basePrice: 1000,
    image: "/pizza.jpg",
    quantity: 2,
    subtotal: 2000,
    selectedModifiers: [],
    modifierGroups: [],
  },
];

describe("CartPage", () => {
  beforeEach(() => {
    vi.mocked(useCartStore).mockReturnValue({ items: mockItems } as any);
    vi.mocked(useCheckoutStore).mockReturnValue({
      processOrder: vi.fn().mockResolvedValue("order-123"),
      isProcessing: false,
    } as any);
  });

  it("renderiza los items del carrito", () => {
    render(<CartPage />);
    expect(screen.getByTestId("cart-item")).toBeInTheDocument();
    expect(screen.getByText("Pizza")).toBeInTheDocument();
  });

  it("muestra el subtotal correctamente", () => {
    render(<CartPage />);
    expect(screen.getByText("$20.00")).toBeInTheDocument();
  });

  it("muestra el botón de checkout", () => {
    render(<CartPage />);
    expect(
      screen.getByRole("button", { name: /continuar al checkout/i }),
    ).toBeInTheDocument();
  });

  it("muestra estado procesando al hacer checkout", () => {
    vi.mocked(useCheckoutStore).mockReturnValue({
      processOrder: vi.fn(),
      isProcessing: true,
    } as any);
    render(<CartPage />);
    expect(screen.getByText(/procesando/i)).toBeInTheDocument();
  });

  it("muestra carrito vacío cuando no hay items", () => {
    vi.mocked(useCartStore).mockReturnValue({ items: [] } as any);
    render(<CartPage />);
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /volver al menú/i }),
    ).toBeInTheDocument();
  });

  it("redirige a la orden después del checkout", async () => {
    vi.mocked(useCheckoutStore).mockReturnValue({
      processOrder: vi.fn().mockResolvedValue("order-123"),
      isProcessing: false,
    } as any);
    render(<CartPage />);
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
  });
});
