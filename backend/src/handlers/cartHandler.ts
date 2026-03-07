import { Request, Response } from "express";
import { cartService } from "../services/cartService";

export const getCart = async (
  req: Request<{ userId: string }>,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    const cart = await cartService.getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const { userId, item, correlationId } = req.body;

    const updatedCart = await cartService.addItemToCart(
      userId,
      item,
      correlationId,
    );

    res.status(200).json(updatedCart);
  } catch (error: any) {
    if (error.message === "PAYLOAD_TOO_LARGE") {
      return res.status(400).json({ message: "El item excede los 16KB" });
    }
    res.status(500).json({ message: "Error al agregar al carrito" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { userId, item, correlationId } = req.body;

    const updatedCart = await cartService.updateCartItem(
      userId,
      item,
      correlationId,
    );

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar item" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { userId, cartItemId, correlationId } = req.body;

    const updatedCart = await cartService.removeCartItem(
      userId,
      cartItemId,
      correlationId,
    );

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar item" });
  }
};
