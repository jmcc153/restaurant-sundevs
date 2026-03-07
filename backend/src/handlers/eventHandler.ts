import { Request, Response } from "express";
import { eventService } from "../services/eventService";
import { orderService } from "../services/orderService";

export const getTimeline = async (
  req: Request<{ orderId: string }>,
  res: Response,
) => {
  try {
    const { orderId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(req.query.pageSize as string) || 50),
    );

    const order = await orderService.getOrderById(orderId);
    const timeline = await eventService.getTimeline(
      order.correlationId,
      page,
      pageSize,
    );
    res.status(200).json(timeline);
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.status(500).json({ message: "Error al obtener el timeline" });
  }
};

export const getEventsByCorrelationId = async (
  req: Request<{ correlationId: string }>,
  res: Response,
) => {
  try {
    const { correlationId } = req.params;
    const events = await eventService.findByCorrelationId(correlationId);
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener eventos por Correlation ID" });
  }
};
