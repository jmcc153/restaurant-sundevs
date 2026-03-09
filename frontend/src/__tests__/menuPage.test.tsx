import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/services/menu", () => ({
  menuService: {
    getMenu: vi.fn().mockResolvedValue([
      {
        id: "1",
        name: "Pizza",
        description: "Rica",
        basePrice: 1000,
        image: "/pizza.jpg",
      },
      {
        id: "2",
        name: "Burger",
        description: "Jugosa",
        basePrice: 800,
        image: "/burger.jpg",
      },
    ]),
  },
}));

vi.mock("@/components/menu/productCard", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

import Home from "../app/page";

describe("Home Page", () => {
  it("renderiza el título del menú", async () => {
    render(await Home());
    expect(screen.getByText(/nuestro menú/i)).toBeInTheDocument();
  });

  it("renderiza una card por cada producto", async () => {
    render(await Home());
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(2);
  });

  it("renderiza los nombres de los productos", async () => {
    render(await Home());
    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("Burger")).toBeInTheDocument();
  });

  it("renderiza la descripción del menú", async () => {
    render(await Home());
    expect(screen.getByText(/mejores ingredientes/i)).toBeInTheDocument();
  });
});
