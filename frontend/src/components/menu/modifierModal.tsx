"use client";

import { useState } from "react";
import { Product, ModifierOption } from "@/types";
import { SelectedModifier } from "@/types/cart";
import { Modal } from "../shared/modal";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface ModifierModalProps {
  product: Product;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ModifierModal = ({
  product,
  quantity,
  open,
  onOpenChange,
}: ModifierModalProps) => {
  const [selections, setSelections] = useState<
    Record<string, ModifierOption[]>
  >({});
  const addItem = useCartStore((s) => s.addItem);

  const handleCheck = (
    groupId: string,
    option: ModifierOption,
    checked: boolean,
    max: number,
  ) => {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      if (!checked)
        return {
          ...prev,
          [groupId]: current.filter((o) => o.name !== option.name),
        };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, option] };
    });
  };

  const isSelected = (groupId: string, option: ModifierOption) =>
    selections[groupId]?.some((o) => o.name === option.name) ?? false;

  const isValid = product.modifierGroups?.every((group) => {
    if (!group.required) return true;
    return (selections[group.id]?.length ?? 0) > 0;
  });

  const extraTotal = Object.values(selections)
    .flat()
    .reduce((sum, opt) => sum + opt.extraPrice, 0);
  const finalSubtotal = (product.basePrice + extraTotal) * quantity;

  const handleAddToCart = () => {
    const selectedModifiers: SelectedModifier[] = [];

    product.modifierGroups?.forEach((group) => {
      selections[group.id]?.forEach((option) => {
        selectedModifiers.push({ groupName: group.name, option });
      });
    });

    addItem({
      ...product,
      cartItemId: uuidv4(),
      selectedModifiers,
      quantity: quantity,
      subtotal: product.basePrice * quantity + extraTotal,
    });

    setSelections({});
    onOpenChange(false);
    toast.success(`${quantity} ${product.name} agregado al carrito`);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-[440px] p-4 overflow-hidden border-none"
      title={product.name}
    >
      <div className="relative w-full h-44 group">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h2 className="text-xl font-bold tracking-tight">{product.name}</h2>
          <p className="text-[11px] text-gray-300 line-clamp-1 opacity-90">
            {product.description}
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="grid gap-6 p-5 max-h-[40vh] overflow-y-auto scrollbar-none">
          {product.modifierGroups?.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  {group.name}
                  {group.required && (
                    <span className="text-[9px] text-orange-600 font-black tracking-normal underline">
                      OBLIGATORIO
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {group.maxSelection === 1
                    ? "Selecciona una opción"
                    : `Máximo ${group.maxSelection} opciones`}
                </p>
              </div>

              <div className="grid gap-1.5">
                {group.options.map((option) => {
                  const selected = isSelected(group.id, option);
                  return (
                    <label
                      key={option.name}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                        ${selected ? "border-primary bg-primary/[0.03] shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                          ${selected ? "bg-primary border-primary" : "border-slate-300"}`}
                        >
                          {selected && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        {option.name}
                      </div>
                      {option.extraPrice > 0 && (
                        <span className="text-xs font-bold text-primary">
                          +{formatPrice(option.extraPrice)}
                        </span>
                      )}
                      <Checkbox
                        className="sr-only"
                        checked={selected}
                        onCheckedChange={(c) =>
                          handleCheck(group.id, option, !!c, group.maxSelection)
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div className="p-5 bg-slate-50 border-t flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Subtotal ({quantity} uds.)
            </span>
            <span className="text-xl font-black text-slate-900">
              {formatPrice(finalSubtotal)}
            </span>
          </div>
          <Button
            className="w-full h-12 rounded-xl text-sm font-bold shadow-md active:scale-95"
            disabled={!isValid}
            onClick={handleAddToCart}
          >
            Agregar {quantity} al carrito
          </Button>
        </div>
      </div>
    </Modal>
  );
};
