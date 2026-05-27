import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAllProducts,
  getProductById,
  loadAllProducts,
  saveProductToStore,
} from "@/lib/admin-store";
import { USE_MOCK } from "@/lib/api-client";
import { formatVnd } from "@/lib/formatVnd";
import type { PublicProduct } from "@/data/public-mock";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function AdminProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);
  const isNew = id === "new";
  const [ready, setReady] = useState(isNew);
  const existing = getProductById(productId);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<PublicProduct>(
    existing ?? {
      product_id: Math.max(0, ...getAllProducts().map((p) => p.product_id)) + 1,
      product_name: "",
      description: "",
      price: 100_000,
      stock_quantity: 10,
      image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600",
      is_active: true,
    }
  );

  useEffect(() => {
    if (isNew) return;
    void loadAllProducts().then(() => {
      const p = getProductById(productId);
      if (p) setForm(p);
      setReady(true);
    });
  }, [isNew, productId]);

  if (!isNew && ready && !getProductById(productId)) {
    return <Navigate to="/admin/products" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void saveProductToStore(form, isNew).then(() => {
      setSaved(true);
      setTimeout(() => navigate("/admin/products"), 800);
    });
  };

  return (
    <div>
      <AdminPageHeader
        title={isNew ? "New product" : form.product_name}
        description={
          USE_MOCK
            ? "Changes save locally (mock mode)."
            : "Changes are sent to the products API."
        }
        badge="Admin"
      />

      <Link to="/admin/products" className="admin-quick-action mb-6 inline-flex w-fit gap-2">
        <ArrowLeft size={16} /> Back to products
      </Link>

      {saved ? (
        <div className="admin-panel mb-6 flex items-center gap-2 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} /> Product saved (mock localStorage).
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="admin-panel space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Product name</label>
            <input
              required
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              className={adminInputClass()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Price (VND)</label>
            <input
              required
              type="number"
              min={1000}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={adminInputClass()}
            />
            <p className="text-xs text-slate-500">{formatVnd(form.price)}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Stock quantity</label>
            <input
              required
              type="number"
              min={0}
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
              className={adminInputClass()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Status</label>
            <select
              value={form.is_active ? "1" : "0"}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })}
              className={adminInputClass()}
            >
              <option value="1">Active — visible on shop</option>
              <option value="0">Inactive — hidden</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-500">Image URL</label>
          <input
            required
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={adminInputClass()}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={adminInputClass("min-h-[120px] py-3")}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="admin-btn-primary">
            Save product
          </button>
          <Link to="/admin/products" className="admin-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
