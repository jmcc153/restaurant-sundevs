import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@/models/cart", () => {
  const mockLean = vi.fn();
  const mockSave = vi.fn();

  const mockFindOne = vi.fn(() => ({ lean: mockLean }));
  const mockFindOneAndUpdate = vi.fn(() => ({ lean: mockLean }));

  return {
    Cart: {
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
      mockSave,
    },
  };
});

vi.mock("@/models/event", () => {
  const mockSave = vi.fn().mockResolvedValue({});
  const MockEvent = vi.fn(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = mockSave;
  });
  return { Event: MockEvent };
});

vi.mock("uuid", () => ({ v4: vi.fn(() => "mock-uuid") }));

import { Cart } from "@/models/cart";
import { cartRepository } from "@/repository/cartRepository";
import { cartService } from "@/services/cartService";
import {
  getCart,
  addItem,
  updateItem,
  deleteItem,
} from "@/handlers/cartHandler";
import type { CartItemType } from "@/types/cart";

const getMocks = () => {
  const findOne = Cart.findOne as ReturnType<typeof vi.fn>;
  const findOneAndUpdate = Cart.findOneAndUpdate as ReturnType<typeof vi.fn>;
  const lean = vi.fn();

  findOne.mockReturnValue({ lean });
  findOneAndUpdate.mockReturnValue({ lean });
  return { findOne, findOneAndUpdate, lean };
};

const createRes = () => {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
};

const mockItem: CartItemType = {
  cartItemId: "cart-1",
  productId: "prod-1",
  name: "Pizza",
  description: "Deliciosa",
  basePrice: 1000,
  image: "/pizza.jpg",
  selectedModifiers: [],
  modifierGroups: [],
  quantity: 2,
  subtotal: 2000,
};

const mockCart = { userId: "user-1", items: [mockItem] };

describe("Cart Domain - Unit Tests", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("Repository Layer", () => {
    it("findByUserId: debe buscar con el userId correcto", async () => {
      const { findOne, lean } = getMocks();
      lean.mockResolvedValue(mockCart);

      const result = await cartRepository.findByUserId("user-1");

      expect(findOne).toHaveBeenCalledWith({ userId: "user-1" });
      expect(result).toEqual(mockCart);
    });

    it("save: debe llamar findOneAndUpdate con upsert", async () => {
      const { findOneAndUpdate, lean } = getMocks();
      lean.mockResolvedValue(mockCart);

      await cartRepository.save("user-1", [mockItem]);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1" },
        { userId: "user-1", items: [mockItem] },
        expect.objectContaining({ upsert: true }),
      );
    });

    it("clear: debe vaciar los items del carrito", async () => {
      const { findOneAndUpdate, lean } = getMocks();
      lean.mockResolvedValue({ ...mockCart, items: [] });

      await cartRepository.clear("user-1");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1" },
        { items: [] },
        expect.anything(),
      );
    });

    it("removeItem: debe usar $pull con el cartItemId correcto", async () => {
      const { findOneAndUpdate, lean } = getMocks();
      lean.mockResolvedValue(mockCart);

      await cartRepository.removeItem("user-1", "cart-1");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1" },
        { $pull: { items: { cartItemId: "cart-1" } } },
        expect.anything(),
      );
    });
  });

  describe("Service Layer", () => {
    it("getCartByUserId: retorna el carrito del usuario", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue(mockCart);

      const result = await cartService.getCartByUserId("user-1");

      expect(result).toEqual(mockCart);
    });

    it("addItemToCart: agrega item a carrito existente", async () => {
      const { findOne, findOneAndUpdate, lean } = getMocks();

      lean.mockResolvedValueOnce(mockCart);
      lean.mockResolvedValueOnce({
        ...mockCart,
        items: [...mockCart.items, mockItem],
      });

      const newItem = { ...mockItem, cartItemId: "cart-2" };
      const result = await cartService.addItemToCart(
        "user-1",
        newItem,
        "corr-1",
      );

      expect(findOne).toHaveBeenCalled();
      expect(findOneAndUpdate).toHaveBeenCalled();
      expect(result?.items).toHaveLength(2);
    });

    it("addItemToCart: crea carrito si no existía", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValueOnce(null);
      lean.mockResolvedValueOnce({ userId: "user-1", items: [mockItem] });

      const result = await cartService.addItemToCart(
        "user-1",
        mockItem,
        "corr-1",
      );

      expect(result?.items).toHaveLength(1);
    });

    it("updateCartItem: actualiza item existente", async () => {
      const { lean } = getMocks();
      const updatedItem = { ...mockItem, quantity: 5, subtotal: 5000 };
      lean.mockResolvedValueOnce(mockCart);
      lean.mockResolvedValueOnce({ ...mockCart, items: [updatedItem] });

      const result = await cartService.updateCartItem(
        "user-1",
        updatedItem,
        "corr-1",
      );

      expect(result?.items[0].quantity).toBe(5);
    });

    it("removeCartItem: elimina item y guarda evento", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue({ ...mockCart, items: [] });

      const result = await cartService.removeCartItem(
        "user-1",
        "cart-1",
        "corr-1",
      );

      expect(result?.items).toHaveLength(0);
    });
  });

  describe("Handler Layer", () => {
    it("getCart: responde 200 con el carrito", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue(mockCart);

      const req = { params: { userId: "user-1" } } as Request<{
        userId: string;
      }>;
      const res = createRes();

      await getCart(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
      expect((res as any).json).toHaveBeenCalledWith(mockCart);
    });

    it("getCart: responde 500 en error", async () => {
      const { lean } = getMocks();
      lean.mockRejectedValue(new Error("DB error"));

      const req = { params: { userId: "user-1" } } as Request<{
        userId: string;
      }>;
      const res = createRes();

      await getCart(req, res);

      expect((res as any).status).toHaveBeenCalledWith(500);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "Error al obtener el carrito",
      });
    });

    it("addItem: responde 200 con carrito actualizado", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValueOnce(mockCart);
      lean.mockResolvedValueOnce(mockCart);

      const req = {
        body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
      } as Request;
      const res = createRes();

      await addItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
    });

    it("addItem: responde 400 si payload es muy grande", async () => {
      const { lean } = getMocks();
      lean.mockRejectedValue(new Error("PAYLOAD_TOO_LARGE"));

      const req = {
        body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
      } as Request;
      const res = createRes();

      await addItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(400);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "El item excede los 16KB",
      });
    });

    it("updateItem: responde 200 con carrito actualizado", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValueOnce(mockCart);
      lean.mockResolvedValueOnce(mockCart);

      const req = {
        body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
      } as Request;
      const res = createRes();

      await updateItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
    });

    it("updateItem: responde 500 en error", async () => {
      const { lean } = getMocks();
      lean.mockRejectedValue(new Error("DB error"));

      const req = {
        body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
      } as Request;
      const res = createRes();

      await updateItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(500);
    });

    it("deleteItem: responde 200 al eliminar", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue({ ...mockCart, items: [] });

      const req = {
        body: {
          userId: "user-1",
          cartItemId: "cart-1",
          correlationId: "corr-1",
        },
      } as Request;
      const res = createRes();

      await deleteItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
    });

    it("deleteItem: responde 500 en error", async () => {
      const { lean } = getMocks();
      lean.mockRejectedValue(new Error("DB error"));

      const req = {
        body: {
          userId: "user-1",
          cartItemId: "cart-1",
          correlationId: "corr-1",
        },
      } as Request;
      const res = createRes();

      await deleteItem(req, res);

      expect((res as any).status).toHaveBeenCalledWith(500);
    });
  });
});
