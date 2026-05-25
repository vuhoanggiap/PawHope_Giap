import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  const { user, cartCount } = usePublicAuth();

  if (!user) {
    return (
      <Link
        to="/login"
        state={{ from: "/shop" }}
        className="public-touch-target relative rounded-full text-[#2c5f51] transition-colors hover:bg-[#fdfaf5]"
        aria-label="Sign in to view cart"
      >
        <ShoppingBag size={22} />
      </Link>
    );
  }

  return (
    <Link
      to="/cart"
      className="public-touch-target relative rounded-full text-[#2c5f51] transition-colors hover:bg-[#fdfaf5]"
      aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
    >
      <ShoppingBag size={22} />
      {cartCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#f6931d] text-white text-[10px] font-bold">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      ) : null}
    </Link>
  );
}
