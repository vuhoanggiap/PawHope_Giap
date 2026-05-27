import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { formatVnd } from "@/lib/formatVnd";
import { ShoppingBag } from "lucide-react";

export function ShopPage() {
  const { products, loading, error } = useProductCatalog();

  return (
    <>
      <PageHero
        title="Support shop"
        subtitle="Every purchase helps fund rescue, medical care, and daily sanctuary operations."
        imageUrl="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1600"
      />

      <section className="public-section soft-section-cream">
        <div className="public-container">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <p className="soft-subtext text-sm">
              {loading
                ? "Loading products…"
                : error
                  ? `Could not reach API — showing local catalog. (${error})`
                  : `${products.length} items`}{" "}
              · Proceeds go to PawsHopeNet programs
            </p>
            <Link to="/donate" className="text-sm font-medium text-[#f6931d] hover:underline">
              Prefer to donate directly? →
            </Link>
          </div>

          <div className="public-card-grid">
            {products.map((p) => (
              <Link
                key={p.product_id}
                to={`/shop/${p.product_id}`}
                className="soft-card-hover overflow-hidden group"
              >
                <img src={p.image_url} alt={p.product_name} className="h-48 w-full object-cover" />
                <div className="p-5 space-y-2">
                  <p className="font-semibold text-[#2c5f51] group-hover:text-[#f6931d] transition-colors">
                    {p.product_name}
                  </p>
                  <p className="text-sm soft-subtext line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-[#3d6b5c]">{formatVnd(p.price)}</span>
                    <span className="text-xs soft-subtext flex items-center gap-1">
                      <ShoppingBag size={14} /> {p.stock_quantity} left
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
