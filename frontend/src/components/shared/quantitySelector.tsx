"use client";

import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (delta: number) => void;
  min?: number;
}

export const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 1,
}: QuantitySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => onQuantityChange(-1)}
        disabled={quantity <= min}
      >
        -
      </Button>
      {quantity}
      <Button variant="outline" onClick={() => onQuantityChange(1)}>
        +
      </Button>
    </div>
  );
};
