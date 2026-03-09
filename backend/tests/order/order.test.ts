import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@/models/order", () => {
  const mockLean = vi.fn();
  const mockSave = vi.fn();

  const MockOrder = Object.assign(
    vi.fn(function (this: any) {
      this.save = mockSave;
    }),
    {
      findOne: vi.fn(() => ({ lean: mockLean })),
      find: vi.fn(() => ({ sort: vi.fn(() => ({ lean: mockLean })) })),
      findOneAndUpdate: vi.fn(() => ({ lean: mockLean })),
    },
  );

  return { Order: MockOrder };
});

vi.mock("@/models/cart", () => {
  const mockLean = vi.fn();
  const mockFindOne = vi.fn(() => ({ lean: mockLean }));
  const mockFindOneAndUpdate = vi.fn(() => ({ lean: mockLean }));
  return {
    Cart: { findOne: mockFindOne, findOneAndUpdate: mockFindOneAndUpdate },
  };
});

vi.mock("@/models/product", () => {
  const mockLean = vi.fn();
  return {
    Product: {
      find: vi.fn(() => ({ lean: mockLean })),
      findOne: vi.fn(() => ({ lean: mockLean })),
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

vi.mock("uuid", () => ({ v4: vi.fn(() => "order-uuid-123") }));

import { Order } from "@/models/order";
import { Cart } from "@/models/cart";
import { Product } from "@/models/product";
import { orderRepository } from "@/repository/orderRepository";
import { orderService } from "@/services/orderService";
import {
  createOrder,
  getOrder,
  getOrdersByUser,
  updateOrderStatus,
} from "@/handlers/orderHandler";
import type { OrderItemType } from "@/types/order";

const getOrderMocks = () => {
  const findOne = Order.findOne as ReturnType<typeof vi.fn>;
  const findOneAndUpdate = Order.findOneAndUpdate as ReturnType<typeof vi.fn>;
  const find = Order.find as ReturnType<typeof vi.fn>;
  const lean = vi.fn();
  findOne.mockReturnValue({ lean });
  findOneAndUpdate.mockReturnValue({ lean });
  find.mockReturnValue({ sort: vi.fn(() => ({ lean })) });
  const saveMock = (Order as any).mock?.results?.[0]?.value?.save ?? vi.fn();
  return { findOne, findOneAndUpdate, find, lean, saveMock };
};

const getCartMocks = () => {
  const findOne = Cart.findOne as ReturnType<typeof vi.fn>;
  const findOneAndUpdate = Cart.findOneAndUpdate as ReturnType<typeof vi.fn>;
  const lean = vi.fn();
  findOne.mockReturnValue({ lean });
  findOneAndUpdate.mockReturnValue({ lean });

  return { findOne, findOneAndUpdate, lean };
};

const getProductMocks = () => {
  const findOne = Product.findOne as ReturnType<typeof vi.fn>;
  const lean = vi.fn();
  findOne.mockReturnValue({ lean });
  return { findOne, lean };
};

const createRes = () => {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
};

const mockOrderItems: OrderItemType[] = [
  {
    cartItemId: "cart-1",
    productId: "prod-1",
    name: "Pizza",
    quantity: 2,
    unitPrice: 1000,
    modifiers: [],
    subtotal: 2000,
  },
];

const mockOrder = {
  orderId: "order-uuid-123",
  userId: "user-1",
  correlationId: "corr-1",
  idempotencyKey: "idem-1",
  status: "PENDING" as const,
  items: mockOrderItems,
  total: 2000,
};

const mockCartWithItems = {
  userId: "user-1",
  items: [
    {
      cartItemId: "cart-1",
      id: "prod-1",
      name: "Pizza",
      description: "Rica",
      basePrice: 1000,
      image: "/pizza.jpg",
      selectedModifiers: [],
      modifierGroups: [],
      quantity: 2,
      subtotal: 2000,
    },
  ],
};

const mockProduct = {
  id: "prod-1",
  name: "Pizza",
  basePrice: 1000,
};

describe("Order Domain - Unit Tests", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("Repository Layer", () => {
    it("findByOrderId: busca con orderId correcto", async () => {
      const { findOne, lean } = getOrderMocks();
      lean.mockResolvedValue(mockOrder);

      const result = await orderRepository.findByOrderId("order-uuid-123");

      expect(findOne).toHaveBeenCalledWith({ orderId: "order-uuid-123" });
      expect(result).toEqual(mockOrder);
    });

    it("findByIdempotencyKey: busca con idempotencyKey correcto", async () => {
      const { findOne, lean } = getOrderMocks();
      lean.mockResolvedValue(mockOrder);

      await orderRepository.findByIdempotencyKey("idem-1");

      expect(findOne).toHaveBeenCalledWith({ idempotencyKey: "idem-1" });
    });

    it("findByUserId: busca y ordena por createdAt desc", async () => {
      const { find } = getOrderMocks();
      const sortMock = vi.fn(() => ({
        lean: vi.fn().mockResolvedValue([mockOrder]),
      }));
      find.mockReturnValue({ sort: sortMock });

      await orderRepository.findByUserId("user-1");

      expect(find).toHaveBeenCalledWith({ userId: "user-1" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("updateStatus: llama findOneAndUpdate con status nuevo", async () => {
      const { findOneAndUpdate, lean } = getOrderMocks();
      lean.mockResolvedValue({ ...mockOrder, status: "CONFIRMED" });

      await orderRepository.updateStatus("order-uuid-123", "CONFIRMED");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { orderId: "order-uuid-123" },
        { status: "CONFIRMED" },
        expect.anything(),
      );
    });
  });

  describe("Service Layer", () => {
    it("checkout: retorna orden existente si idempotencyKey ya existe", async () => {
      const { findOne, lean } = getOrderMocks();
      lean.mockResolvedValue(mockOrder);

      const result = await orderService.checkout("user-1", "idem-1", "corr-1");

      expect(findOne).toHaveBeenCalledWith({ idempotencyKey: "idem-1" });
      expect(result).toEqual(mockOrder);
    });

    it("checkout: lanza CART_EMPTY si el carrito está vacío", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { lean: cartLean } = getCartMocks();

      orderLean.mockResolvedValue(null);
      cartLean.mockResolvedValue({ userId: "user-1", items: [] });

      await expect(
        orderService.checkout("user-1", "idem-new", "corr-1"),
      ).rejects.toThrow("CART_EMPTY");
    });

    it("checkout: lanza CART_EMPTY si no hay carrito", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { lean: cartLean } = getCartMocks();

      orderLean.mockResolvedValue(null);
      cartLean.mockResolvedValue(null);

      await expect(
        orderService.checkout("user-1", "idem-new", "corr-1"),
      ).rejects.toThrow("CART_EMPTY");
    });

    it("checkout: lanza PRODUCT_NOT_FOUND si producto no existe en catálogo", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { lean: cartLean } = getCartMocks();
      const { lean: productLean } = getProductMocks();

      orderLean.mockResolvedValue(null);
      cartLean.mockResolvedValue(mockCartWithItems);
      productLean.mockResolvedValue(null);

      await expect(
        orderService.checkout("user-1", "idem-new", "corr-1"),
      ).rejects.toThrow("PRODUCT_NOT_FOUND");
    });

    it("getOrderById: retorna la orden correcta", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById("order-uuid-123");

      expect(result).toEqual(mockOrder);
    });

    it("getOrderById: lanza ORDER_NOT_FOUND si no existe", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(null);

      await expect(orderService.getOrderById("no-existe")).rejects.toThrow(
        "ORDER_NOT_FOUND",
      );
    });

    it("updateOrderStatus: lanza ORDER_NOT_FOUND si no existe", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(null);

      await expect(
        orderService.updateOrderStatus("no-existe", "CONFIRMED"),
      ).rejects.toThrow("ORDER_NOT_FOUND");
    });

    it("updateOrderStatus: actualiza el status correctamente", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValueOnce(mockOrder);
      lean.mockResolvedValueOnce({ ...mockOrder, status: "CONFIRMED" });

      const result = await orderService.updateOrderStatus(
        "order-uuid-123",
        "CONFIRMED",
      );

      expect(result?.status).toBe("CONFIRMED");
    });
  });

  describe("Handler Layer", () => {
    it("createOrder: responde 400 si falta Idempotency-Key", async () => {
      const req = {
        headers: {},
        body: { userId: "user-1", correlationId: "corr-1" },
      } as Request;
      const res = createRes();

      await createOrder(req, res);

      expect((res as any).status).toHaveBeenCalledWith(400);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "Idempotency-Key header es requerido",
      });
    });

    it("createOrder: responde 400 si carrito está vacío", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { lean: cartLean } = getCartMocks();
      orderLean.mockResolvedValue(null);
      cartLean.mockResolvedValue(null);

      const req = {
        headers: { "idempotency-key": "idem-1" },
        body: { userId: "user-1", correlationId: "corr-1" },
      } as unknown as Request;
      const res = createRes();

      await createOrder(req, res);

      expect((res as any).status).toHaveBeenCalledWith(400);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "El carrito está vacío",
      });
    });

    it("createOrder: responde 400 si producto no encontrado", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { lean: cartLean } = getCartMocks();
      const { lean: productLean } = getProductMocks();

      orderLean.mockResolvedValue(null);
      cartLean.mockResolvedValue(mockCartWithItems);
      productLean.mockResolvedValue(null);

      const req = {
        headers: { "idempotency-key": "idem-1" },
        body: { userId: "user-1", correlationId: "corr-1" },
      } as unknown as Request;
      const res = createRes();

      await createOrder(req, res);

      expect((res as any).status).toHaveBeenCalledWith(400);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "Producto no encontrado en el catálogo",
      });
    });

    it("getOrder: responde 200 con la orden", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(mockOrder);

      const req = { params: { orderId: "order-uuid-123" } } as Request<{
        orderId: string;
      }>;
      const res = createRes();

      await getOrder(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
      expect((res as any).json).toHaveBeenCalledWith(mockOrder);
    });

    it("getOrder: responde 404 si no existe", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(null);

      const req = { params: { orderId: "no-existe" } } as Request<{
        orderId: string;
      }>;
      const res = createRes();

      await getOrder(req, res);

      expect((res as any).status).toHaveBeenCalledWith(404);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "Orden no encontrada",
      });
    });

    it("getOrdersByUser: responde 200 con lista de órdenes", async () => {
      const { find } = getOrderMocks();
      find.mockReturnValue({
        sort: vi.fn(() => ({ lean: vi.fn().mockResolvedValue([mockOrder]) })),
      });

      const req = { params: { userId: "user-1" } } as Request<{
        userId: string;
      }>;
      const res = createRes();

      await getOrdersByUser(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
      expect((res as any).json).toHaveBeenCalledWith([mockOrder]);
    });

    it("updateOrderStatus: responde 200 con orden actualizada", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValueOnce(mockOrder);
      lean.mockResolvedValueOnce({ ...mockOrder, status: "CONFIRMED" });

      const req = {
        params: { orderId: "order-uuid-123" },
        body: { status: "CONFIRMED" },
      } as unknown as Request;
      const res = createRes();

      await updateOrderStatus(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
    });

    it("updateOrderStatus: responde 404 si orden no existe", async () => {
      const { lean } = getOrderMocks();
      lean.mockResolvedValue(null);

      const req = {
        params: { orderId: "no-existe" },
        body: { status: "CONFIRMED" },
      } as unknown as Request;
      const res = createRes();

      await updateOrderStatus(req, res);

      expect((res as any).status).toHaveBeenCalledWith(404);
    });
  });
});
