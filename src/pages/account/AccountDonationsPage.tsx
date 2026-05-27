import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import {
  formatPublicEnum,
  type PublicItemDonation,
  type PublicMoneyDonation,
} from "@/data/public-mock";
import { loadUserDonations } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { Gift, Package } from "lucide-react";

export function AccountDonationsPage() {
  const { user } = usePublicAuth();
  const [money, setMoney] = useState<PublicMoneyDonation[]>([]);
  const [items, setItems] = useState<PublicItemDonation[]>([]);

  useEffect(() => {
    if (!user) return;
    void loadUserDonations(user.userId).then(({ money: m, items: i }) => {
      setMoney(m);
      setItems(i);
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="soft-card p-6 md:p-8">
        <h2 className="soft-heading mb-1 text-lg">My donations</h2>
        <p className="soft-subtext mb-6 text-sm">Financial gifts and supply donations linked to your account.</p>

        {money.length === 0 && items.length === 0 ? (
          <div className="py-12 text-center soft-subtext">
            <p>No donations recorded yet.</p>
            <Link to="/donate" className="mt-4 inline-block font-medium text-[#f6931d] hover:underline">
              Make a donation →
            </Link>
          </div>
        ) : null}

        {money.length > 0 ? (
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <Gift size={18} className="text-[#c97a12]" />
              <h3 className="font-semibold text-[#2c5f51]">Money gifts</h3>
            </div>
            <div className="space-y-3">
              {money.map((d) => (
                <div
                  key={d.donation_id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#2c5f51]/[0.06] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#2c5f51]">{d.campaign_title}</p>
                    <p className="soft-subtext mt-1 text-sm">{d.created_at}</p>
                    <span className="mt-2 inline-block rounded-full bg-[#fef0df] px-2.5 py-0.5 text-xs font-medium text-[#c97a12]">
                      {formatPublicEnum(d.payment_status)}
                    </span>
                  </div>
                  <p className="font-bold text-[#3d6b5c]">{formatVnd(d.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Package size={18} className="text-[#3d6b5c]" />
              <h3 className="font-semibold text-[#2c5f51]">Supply donations</h3>
            </div>
            <div className="space-y-3">
              {items.map((d) => (
                <div
                  key={d.item_donation_id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#2c5f51]/[0.06] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#2c5f51]">{d.item_name}</p>
                    <p className="soft-subtext mt-1 text-sm">
                      {formatPublicEnum(d.category)} · {d.quantity}
                    </p>
                    <p className="soft-subtext text-xs">{d.created_at}</p>
                  </div>
                  <span className="rounded-full bg-[#e6f2ec] px-2.5 py-0.5 text-xs font-medium text-[#3d6b5c]">
                    {formatPublicEnum(d.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
