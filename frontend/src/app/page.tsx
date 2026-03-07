import { ProductCard } from "@/components/menu/productCard";
import { menuService } from "@/services/menu";
import { Product } from "@/types/product";

export default async function Home() {
  const menu = await menuService.getMenu<Product[]>();
  console.log("Menú recibido del backend:", menu.length);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Nuestro Menú</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
