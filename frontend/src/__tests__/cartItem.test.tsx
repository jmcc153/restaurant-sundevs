import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartItem } from "../components/cart/cartItem";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, width, height } = props;
    return <img src={src} alt={alt} width={width} height={height} />;
  },
}));

describe("CartItem Component", () => {
  const mockItem = {
    id: "1",
    cartItemId: "cart-1",
    name: "Pizza",
    description: "Delicious pizza",
    basePrice: 1000,
    image: "/pizza.jpg",
    selectedModifiers: [],
    quantity: 2,
    subtotal: 2000,
    modifierGroups: [],
    productId: "1",
  };

  it("debe renderizar el nombre del producto", () => {
    render(<CartItem item={mockItem as any} onEdit={vi.fn()} />);

    const nameElement = screen.getByText(/pizza/i);
    expect(nameElement).toBeInTheDocument();
  });

  it("debe renderizar la imagen con el alt correcto", () => {
    render(<CartItem item={mockItem as any} onEdit={vi.fn()} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Pizza");
  });
});
