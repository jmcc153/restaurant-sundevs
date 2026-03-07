export interface ModifierOption {
  name: string;
  extraPrice: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelection: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  modifierGroups?: ModifierGroup[];
}
