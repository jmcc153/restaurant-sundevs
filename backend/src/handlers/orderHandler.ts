import { Request, Response } from "express";
import { orderService } from "../services/orderService";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] as string;
    if (!idempotencyKey) {
      return res
        .status(400)
        .json({ message: "Idempotency-Key header es requerido" });
    }

    const { userId, correlationId } = req.body;
    const order = await orderService.checkout(
      userId,
      idempotencyKey,
      correlationId,
    );

    res.status(202).json(order);
  } catch (error: any) {
    if (error.message === "CART_EMPTY") {
      return res.status(400).json({ message: "El carrito está vacío" });
    }
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res
        .status(400)
        .json({ message: "Producto no encontrado en el catálogo" });
    }
    if (error.message === "PAYLOAD_TOO_LARGE") {
      return res.status(400).json({ message: "El payload excede los 16KB" });
    }
    res.status(500).json({ message: "Error al crear la orden" });
  }
};

export const getOrder = async (
  req: Request<{ orderId: string }>,
  res: Response,
) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);
    res.status(200).json(order);
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.status(500).json({ message: "Error al obtener la orden" });
  }
};

export const getOrdersByUser = async (
  req: Request<{ userId: string }>,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    const orders = await orderService.getOrdersByUserId(userId);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params as { orderId: string };
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);
    res.status(200).json(order);
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.status(500).json({ message: "Error al actualizar la orden" });
  }
};
