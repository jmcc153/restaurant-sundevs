import express from "express";
import serverless from "serverless-http";
import * as menuHandler from "./handlers/menuHandler";
import * as cartHandler from "./handlers/cartHandler";
import * as eventHandler from "./handlers/eventHandler";
import * as orderHandler from "./handlers/orderHandler";
import { connectDB } from "./lib/db";

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/menu", menuHandler.getMenu);
app.get("/cart/:userId", cartHandler.getCart);
app.post("/cart/items", cartHandler.addItem);
app.put("/cart/items", cartHandler.updateItem);
app.delete("/cart/items", cartHandler.deleteItem);

app.post("/orders", orderHandler.createOrder);
app.get("/orders/user/:userId", orderHandler.getOrdersByUser);
app.get("/orders/:orderId", orderHandler.getOrder);
app.patch("/orders/:orderId/status", orderHandler.updateOrderStatus);
app.get("/orders/:orderId/timeline", eventHandler.getTimeline);

app.get("/events/:correlationId", eventHandler.getEventsByCorrelationId);

export { app };

export const handler = serverless(app);
