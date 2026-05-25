import { useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ShoppingBag, X } from "lucide-react";

type AddToCartToastProps = {
  open: boolean;
  variant?: "success" | "error";
  productName: string;
  quantity?: number;
  message?: string;
  onClose: () => void;
};

export function AddToCartToast({
  open,
  variant = "success",
  productName,
  quantity = 1,
  message,
  onClose,
}: AddToCartToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const isSuccess = variant === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "cart-toast",
        isSuccess ? "cart-toast-success" : "cart-toast-error"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isSuccess ? "bg-[#e6f2ec] text-[#3d6b5c]" : "bg-red-50 text-red-600"
          )}
        >
          {isSuccess ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-semibold text-[#2c5f51]">
            {isSuccess ? "Added to cart" : "Could not add to cart"}
          </p>
          <p className="mt-1 text-sm text-[#5a6b60]">
            {message ??
              (isSuccess
                ? `${quantity} × ${productName} is in your cart.`
                : `Not enough stock for ${productName}.`)}
          </p>
          {isSuccess ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                to="/cart"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f6931d] hover:underline"
              >
                <ShoppingBag size={15} /> View cart
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-[#5a6b60] hover:text-[#2c5f51]"
              >
                Continue shopping
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="public-touch-target -mr-1 -mt-1 shrink-0 rounded-lg text-[#a8b8ae] hover:bg-black/5 hover:text-[#5a6b60]"
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
