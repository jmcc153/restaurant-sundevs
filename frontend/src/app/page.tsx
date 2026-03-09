import { ProductCard } from "@/components/menu/productCard";
import { menuService } from "@/services/menu";
import { Product } from "@/types/product";

export default async function Home() {
  const menu = await menuService.getMenu<Product[]>();

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="flex flex-col items-start mb-12">
        <h1 className="text-4xl font-bold text-center">Nuestro Menú</h1>
        <p className="text-center text-slate-600">
          Descubre nuestros deliciosos platos y bebidas, preparados con los
          mejores ingredientes.
        </p>
      </header>

      <section
        aria-label="Lista de productos"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {menu.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
