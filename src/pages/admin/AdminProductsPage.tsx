import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getAllProducts,
  loadAllProducts,
  toggleProductActiveInStore,
} from "@/lib/admin-store";
import { formatVnd } from "@/lib/formatVnd";
import { ChevronRight, Package } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminProductsPage() {
  const [products, setProducts] = useState(() => getAllProducts());

  useEffect(() => {
    void loadAllProducts().then(setProducts);
  }, []);

  const refresh = () => void loadAllProducts().then(setProducts);

  const handleToggle = (productId: number) => {
    void toggleProductActiveInStore(productId).then(refresh);
  };

  const activeCount = products.filter((p) => p.is_active).length;
  const lowStock = products.filter((p) => p.stock_quantity <= 10).length;

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage support shop merchandise, pricing, stock, and visibility on the public site."
        badge="Admin"
      />

      <div className="mb-6 flex justify-end">
        <Link to="/admin/products/new" className="admin-btn-primary gap-2">
          <Package size={16} /> New product
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Total products</p>
          <p className="mt-1 text-2xl font-semibold text-white">{products.length}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Active on shop</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{activeCount}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Low stock (≤10)</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">{lowStock}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.product_id} className="admin-card overflow-hidden">
            <img src={product.image_url} alt={product.product_name} className="h-40 w-full object-cover" />
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{product.product_name}</p>
                  <p className="text-sm text-slate-400">#{product.product_id}</p>
                </div>
                <StatusBadge value={product.is_active ? "ACTIVE" : "INACTIVE"} />
              </div>
              <p className="line-clamp-2 text-sm text-slate-400">{product.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[#f6931d]">{formatVnd(product.price)}</span>
                <span className="text-slate-500">{product.stock_quantity} in stock</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={`/admin/products/${product.product_id}`}
                  className="admin-btn-secondary inline-flex items-center gap-1 text-xs"
                >
                  Edit <ChevronRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggle(product.product_id)}
                  className="admin-btn-secondary text-xs"
                >
                  {product.is_active ? "Hide from shop" : "Publish"}
                </button>
                <Link
                  to={`/shop/${product.product_id}`}
                  className="admin-btn-secondary inline-flex items-center gap-1 text-xs"
                  target="_blank"
                >
                  <Package size={14} /> Preview
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
