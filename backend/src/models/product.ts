import { Schema, model } from "mongoose";

const ModifierOptionsSchema = new Schema({
  name: { type: String, required: true },
  extraPrice: { type: Number, required: true },
});

const ModifierGroupSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  required: { type: Boolean, required: true },
  maxSelection: { type: Number, required: true },
  options: { type: [ModifierOptionsSchema], required: true },
});

const ProductSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  image: { type: String, required: true },
  modifierGroups: { type: [ModifierGroupSchema], required: false },
});

export const Product = model("Product", ProductSchema);
