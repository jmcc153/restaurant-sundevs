import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";
import Image from "next/image";

export function CartItem({ item }: { item: CartItem }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="text-base font-bold text-slate-900 leading-tight">
          {item.name}
        </h3>

        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.selectedModifiers.map((mod, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {mod.option.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs font-medium text-slate-500 pt-1">
          {item.quantity} x {formatPrice(item.basePrice)}
          {item.subtotal > item.basePrice * item.quantity && " + extras"}
        </p>
      </div>
      <div className="text-sm font-black text-slate-900">
        {formatPrice(item.subtotal)}
      </div>
    </div>
  );
}
