"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("@/models/order", () => {
    const mockLean = vitest_1.vi.fn();
    const mockSave = vitest_1.vi.fn();
    const MockOrder = Object.assign(vitest_1.vi.fn(function () {
        this.save = mockSave;
    }), {
        findOne: vitest_1.vi.fn(() => ({ lean: mockLean })),
        find: vitest_1.vi.fn(() => ({ sort: vitest_1.vi.fn(() => ({ lean: mockLean })) })),
        findOneAndUpdate: vitest_1.vi.fn(() => ({ lean: mockLean })),
    });
    return { Order: MockOrder };
});
vitest_1.vi.mock("@/models/cart", () => {
    const mockLean = vitest_1.vi.fn();
    const mockFindOne = vitest_1.vi.fn(() => ({ lean: mockLean }));
    const mockFindOneAndUpdate = vitest_1.vi.fn(() => ({ lean: mockLean }));
    return {
        Cart: { findOne: mockFindOne, findOneAndUpdate: mockFindOneAndUpdate },
    };
});
vitest_1.vi.mock("@/models/product", () => {
    const mockLean = vitest_1.vi.fn();
    return {
        Product: {
            find: vitest_1.vi.fn(() => ({ lean: mockLean })),
            findOne: vitest_1.vi.fn(() => ({ lean: mockLean })),
        },
    };
});
vitest_1.vi.mock("@/models/event", () => {
    const mockSave = vitest_1.vi.fn().mockResolvedValue({});
    const MockEvent = vitest_1.vi.fn(function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    });
    return { Event: MockEvent };
});
vitest_1.vi.mock("uuid", () => ({ v4: vitest_1.vi.fn(() => "order-uuid-123") }));
const order_1 = require("@/models/order");
const cart_1 = require("@/models/cart");
const product_1 = require("@/models/product");
const orderRepository_1 = require("@/repository/orderRepository");
const orderService_1 = require("@/services/orderService");
const orderHandler_1 = require("@/handlers/orderHandler");
const getOrderMocks = () => {
    const findOne = order_1.Order.findOne;
    const findOneAndUpdate = order_1.Order.findOneAndUpdate;
    const find = order_1.Order.find;
    const lean = vitest_1.vi.fn();
    findOne.mockReturnValue({ lean });
    findOneAndUpdate.mockReturnValue({ lean });
    find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ lean })) });
    const saveMock = order_1.Order.mock?.results?.[0]?.value?.save ?? vitest_1.vi.fn();
    return { findOne, findOneAndUpdate, find, lean, saveMock };
};
const getCartMocks = () => {
    const findOne = cart_1.Cart.findOne;
    const findOneAndUpdate = cart_1.Cart.findOneAndUpdate;
    const lean = vitest_1.vi.fn();
    findOne.mockReturnValue({ lean });
    findOneAndUpdate.mockReturnValue({ lean });
    return { findOne, findOneAndUpdate, lean };
};
const getProductMocks = () => {
    const findOne = product_1.Product.findOne;
    const lean = vitest_1.vi.fn();
    findOne.mockReturnValue({ lean });
    return { findOne, lean };
};
const createRes = () => {
    const res = {};
    res.status = vitest_1.vi.fn().mockReturnValue(res);
    res.json = vitest_1.vi.fn().mockReturnValue(res);
    return res;
};
const mockOrderItems = [
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
    status: "PENDING",
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
(0, vitest_1.describe)("Order Domain - Unit Tests", () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.describe)("Repository Layer", () => {
        (0, vitest_1.it)("findByOrderId: busca con orderId correcto", async () => {
            const { findOne, lean } = getOrderMocks();
            lean.mockResolvedValue(mockOrder);
            const result = await orderRepository_1.orderRepository.findByOrderId("order-uuid-123");
            (0, vitest_1.expect)(findOne).toHaveBeenCalledWith({ orderId: "order-uuid-123" });
            (0, vitest_1.expect)(result).toEqual(mockOrder);
        });
        (0, vitest_1.it)("findByIdempotencyKey: busca con idempotencyKey correcto", async () => {
            const { findOne, lean } = getOrderMocks();
            lean.mockResolvedValue(mockOrder);
            await orderRepository_1.orderRepository.findByIdempotencyKey("idem-1");
            (0, vitest_1.expect)(findOne).toHaveBeenCalledWith({ idempotencyKey: "idem-1" });
        });
        (0, vitest_1.it)("findByUserId: busca y ordena por createdAt desc", async () => {
            const { find } = getOrderMocks();
            const sortMock = vitest_1.vi.fn(() => ({
                lean: vitest_1.vi.fn().mockResolvedValue([mockOrder]),
            }));
            find.mockReturnValue({ sort: sortMock });
            await orderRepository_1.orderRepository.findByUserId("user-1");
            (0, vitest_1.expect)(find).toHaveBeenCalledWith({ userId: "user-1" });
            (0, vitest_1.expect)(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        });
        (0, vitest_1.it)("updateStatus: llama findOneAndUpdate con status nuevo", async () => {
            const { findOneAndUpdate, lean } = getOrderMocks();
            lean.mockResolvedValue({ ...mockOrder, status: "CONFIRMED" });
            await orderRepository_1.orderRepository.updateStatus("order-uuid-123", "CONFIRMED");
            (0, vitest_1.expect)(findOneAndUpdate).toHaveBeenCalledWith({ orderId: "order-uuid-123" }, { status: "CONFIRMED" }, vitest_1.expect.anything());
        });
    });
    (0, vitest_1.describe)("Service Layer", () => {
        (0, vitest_1.it)("checkout: retorna orden existente si idempotencyKey ya existe", async () => {
            const { findOne, lean } = getOrderMocks();
            lean.mockResolvedValue(mockOrder);
            const result = await orderService_1.orderService.checkout("user-1", "idem-1", "corr-1");
            (0, vitest_1.expect)(findOne).toHaveBeenCalledWith({ idempotencyKey: "idem-1" });
            (0, vitest_1.expect)(result).toEqual(mockOrder);
        });
        (0, vitest_1.it)("checkout: lanza CART_EMPTY si el carrito está vacío", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { lean: cartLean } = getCartMocks();
            orderLean.mockResolvedValue(null);
            cartLean.mockResolvedValue({ userId: "user-1", items: [] });
            await (0, vitest_1.expect)(orderService_1.orderService.checkout("user-1", "idem-new", "corr-1")).rejects.toThrow("CART_EMPTY");
        });
        (0, vitest_1.it)("checkout: lanza CART_EMPTY si no hay carrito", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { lean: cartLean } = getCartMocks();
            orderLean.mockResolvedValue(null);
            cartLean.mockResolvedValue(null);
            await (0, vitest_1.expect)(orderService_1.orderService.checkout("user-1", "idem-new", "corr-1")).rejects.toThrow("CART_EMPTY");
        });
        (0, vitest_1.it)("checkout: lanza PRODUCT_NOT_FOUND si producto no existe en catálogo", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { lean: cartLean } = getCartMocks();
            const { lean: productLean } = getProductMocks();
            orderLean.mockResolvedValue(null);
            cartLean.mockResolvedValue(mockCartWithItems);
            productLean.mockResolvedValue(null);
            await (0, vitest_1.expect)(orderService_1.orderService.checkout("user-1", "idem-new", "corr-1")).rejects.toThrow("PRODUCT_NOT_FOUND");
        });
        (0, vitest_1.it)("getOrderById: retorna la orden correcta", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(mockOrder);
            const result = await orderService_1.orderService.getOrderById("order-uuid-123");
            (0, vitest_1.expect)(result).toEqual(mockOrder);
        });
        (0, vitest_1.it)("getOrderById: lanza ORDER_NOT_FOUND si no existe", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(null);
            await (0, vitest_1.expect)(orderService_1.orderService.getOrderById("no-existe")).rejects.toThrow("ORDER_NOT_FOUND");
        });
        (0, vitest_1.it)("updateOrderStatus: lanza ORDER_NOT_FOUND si no existe", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(null);
            await (0, vitest_1.expect)(orderService_1.orderService.updateOrderStatus("no-existe", "CONFIRMED")).rejects.toThrow("ORDER_NOT_FOUND");
        });
        (0, vitest_1.it)("updateOrderStatus: actualiza el status correctamente", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValueOnce(mockOrder);
            lean.mockResolvedValueOnce({ ...mockOrder, status: "CONFIRMED" });
            const result = await orderService_1.orderService.updateOrderStatus("order-uuid-123", "CONFIRMED");
            (0, vitest_1.expect)(result?.status).toBe("CONFIRMED");
        });
    });
    (0, vitest_1.describe)("Handler Layer", () => {
        (0, vitest_1.it)("createOrder: responde 400 si falta Idempotency-Key", async () => {
            const req = {
                headers: {},
                body: { userId: "user-1", correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, orderHandler_1.createOrder)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Idempotency-Key header es requerido",
            });
        });
        (0, vitest_1.it)("createOrder: responde 400 si carrito está vacío", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { lean: cartLean } = getCartMocks();
            orderLean.mockResolvedValue(null);
            cartLean.mockResolvedValue(null);
            const req = {
                headers: { "idempotency-key": "idem-1" },
                body: { userId: "user-1", correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, orderHandler_1.createOrder)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "El carrito está vacío",
            });
        });
        (0, vitest_1.it)("createOrder: responde 400 si producto no encontrado", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { lean: cartLean } = getCartMocks();
            const { lean: productLean } = getProductMocks();
            orderLean.mockResolvedValue(null);
            cartLean.mockResolvedValue(mockCartWithItems);
            productLean.mockResolvedValue(null);
            const req = {
                headers: { "idempotency-key": "idem-1" },
                body: { userId: "user-1", correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, orderHandler_1.createOrder)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Producto no encontrado en el catálogo",
            });
        });
        (0, vitest_1.it)("getOrder: responde 200 con la orden", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(mockOrder);
            const req = { params: { orderId: "order-uuid-123" } };
            const res = createRes();
            await (0, orderHandler_1.getOrder)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(mockOrder);
        });
        (0, vitest_1.it)("getOrder: responde 404 si no existe", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(null);
            const req = { params: { orderId: "no-existe" } };
            const res = createRes();
            await (0, orderHandler_1.getOrder)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(404);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Orden no encontrada",
            });
        });
        (0, vitest_1.it)("getOrdersByUser: responde 200 con lista de órdenes", async () => {
            const { find } = getOrderMocks();
            find.mockReturnValue({
                sort: vitest_1.vi.fn(() => ({ lean: vitest_1.vi.fn().mockResolvedValue([mockOrder]) })),
            });
            const req = { params: { userId: "user-1" } };
            const res = createRes();
            await (0, orderHandler_1.getOrdersByUser)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith([mockOrder]);
        });
        (0, vitest_1.it)("updateOrderStatus: responde 200 con orden actualizada", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValueOnce(mockOrder);
            lean.mockResolvedValueOnce({ ...mockOrder, status: "CONFIRMED" });
            const req = {
                params: { orderId: "order-uuid-123" },
                body: { status: "CONFIRMED" },
            };
            const res = createRes();
            await (0, orderHandler_1.updateOrderStatus)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
        });
        (0, vitest_1.it)("updateOrderStatus: responde 404 si orden no existe", async () => {
            const { lean } = getOrderMocks();
            lean.mockResolvedValue(null);
            const req = {
                params: { orderId: "no-existe" },
                body: { status: "CONFIRMED" },
            };
            const res = createRes();
            await (0, orderHandler_1.updateOrderStatus)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(404);
        });
    });
});
//# sourceMappingURL=order.test.js.map