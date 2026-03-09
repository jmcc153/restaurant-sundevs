export interface SelectedModifier {
  groupName: string;
  option: {
    name: string;
    extraPrice: number;
  };
}

export interface modifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelection: number;
  options: {
    name: string;
    extraPrice: number;
  }[];
}

export interface CartItemType {
  cartItemId: string;
  productId: string;
  name: string;
  description: string;
  modifierGroups: modifierGroup[];
  basePrice: number;
  image: string;
  selectedModifiers: SelectedModifier[];
  quantity: number;
  subtotal: number;
}

export interface CartType {
  userId: string;
  items: CartItemType[];
}
