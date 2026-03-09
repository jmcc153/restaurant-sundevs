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
    <div
      role="group"
      aria-label="Selector de cantidad"
      className="flex items-center gap-2"
    >
      <Button
        variant="outline"
        onClick={() => onQuantityChange(-1)}
        disabled={quantity <= min}
        aria-label="Disminuir cantidad"
      >
        -
      </Button>
      <span aria-live="polite" aria-atomic="true">
        {quantity}
      </span>
      <Button
        variant="outline"
        onClick={() => onQuantityChange(1)}
        aria-label="Aumentar cantidad"
      >
        +
      </Button>
    </div>
  );
};
