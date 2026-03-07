import { ModifierOption, Product } from "./index";

export interface SelectedModifier {
  groupName: string;
  option: ModifierOption;
}

export interface CartItemType extends Product {
  cartItemId: string;
  selectedModifiers: SelectedModifier[];
  quantity: number;
  subtotal: number;
}
