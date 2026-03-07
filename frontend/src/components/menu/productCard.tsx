"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantitySelector } from "@/components/shared/quantitySelector";
import { ModifierModal } from "./modifierModal";
import { useCartStore } from "@/store/useCartStore";
import { v4 as uuidv4 } from "uuid";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const hasModifiers =
    product.modifierGroups && product.modifierGroups.length > 0;

  const handleClick = () => {
    if (hasModifiers) {
      setModalOpen(true);
    } else {
      addItem({
        ...product,
        cartItemId: uuidv4(),
        selectedModifiers: [],
        quantity: quantity,
        subtotal: product.basePrice * quantity,
      });
      toast.success(`${quantity} ${product.name} agregado al carrito`);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <Badge variant="secondary">{formatPrice(product.basePrice)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grow">
          <p className="text-muted-foreground text-sm">{product.description}</p>
        </CardContent>
        <CardFooter className="flex items-center gap-4">
          <div className="mr-auto">
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          <Button onClick={handleClick}>{"Agregar al Carrito"}</Button>
        </CardFooter>
      </Card>

      {hasModifiers && (
        <ModifierModal
          key={product.id}
          product={product}
          quantity={quantity}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
};
