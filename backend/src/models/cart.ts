import { Schema, model } from "mongoose";

const SelectedModifierSchema = new Schema(
  {
    groupName: { type: String, required: true },
    option: {
      name: { type: String, required: true },
      extraPrice: { type: Number, required: true },
    },
  },
  { _id: false },
);

const CartItemSchema = new Schema(
  {
    cartItemId: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    modifierGroups: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        required: { type: Boolean, required: true },
        maxSelection: { type: Number, required: true },
        options: [
          {
            name: { type: String, required: true },
            extraPrice: { type: Number, required: true },
          },
        ],
      },
    ],
    basePrice: { type: Number, required: true },
    image: { type: String, required: true },
    selectedModifiers: { type: [SelectedModifierSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart = model("Cart", CartSchema);
