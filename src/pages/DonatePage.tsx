import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  donationQuickAmounts,
  formatPublicEnum,
  itemDonationCategories,
} from "@/data/public-mock";
import { donateItem, donateMoney, getCampaigns } from "@/lib/public-commerce";
import { formatVnd } from "@/lib/formatVnd";
import { cn } from "@/lib/utils";
import { CheckCircle2, Gift, Heart, Package } from "lucide-react";

type Tab = "money" | "items" | "campaigns";

export function DonatePage() {
  const { user } = usePublicAuth();
  const [tab, setTab] = useState<Tab>("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState(1);
  const [amount, setAmount] = useState(200_000);
  const [customAmount, setCustomAmount] = useState("");
  const [moneyDone, setMoneyDone] = useState(false);
  const [itemDone, setItemDone] = useState(false);

  const campaigns = getCampaigns();

  const handleMoney = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const finalAmount = customAmount ? Number(customAmount) : amount;
    donateMoney({
      user_id: user?.userId,
      campaign_id: selectedCampaign,
      donor_name: String(fd.get("donorName") || "Guest"),
      amount: finalAmount,
    });
    setMoneyDone(true);
  };

  const handleItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    donateItem({
      user_id: user?.userId,
      donor_name: String(fd.get("donorName") || ""),
      item_name: String(fd.get("itemName") || ""),
      category: String(fd.get("category") || "OTHER"),
      quantity: String(fd.get("quantity") || ""),
      note: String(fd.get("note") || "") || undefined,
    });
    setItemDone(true);
  };

  const fieldClass = "mt-1 rounded-xl border-[#2c5f51]/10";

  const tabs: { id: Tab; label: string; icon: typeof Heart }[] = [
    { id: "campaigns", label: "Campaigns", icon: Heart },
    { id: "money", label: "Give money", icon: Gift },
    { id: "items", label: "Give supplies", icon: Package },
  ];

  return (
    <>
      <PageHero
        title="Donate"
        subtitle="Financial gifts and supplies keep our sanctuary running every day."
        imageUrl="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600"
      />

      <section className="public-section soft-section-mint">
        <div className="public-container max-w-5xl">
          <div className="public-tab-scroll mb-6 sm:mb-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setMoneyDone(false);
                  setItemDone(false);
                }}
                className={cn(
                  "public-tab-pill inline-flex items-center gap-2 transition-colors",
                  tab === id
                    ? "bg-[#2c5f51] text-white shadow-md"
                    : "bg-white/80 text-[#5a6b60] hover:bg-white border border-[#2c5f51]/10"
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {tab === "campaigns" ? (
            <div className="public-card-grid md:grid-cols-2">
              {campaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100));
                return (
                  <div key={c.campaign_id} className="soft-card p-6 space-y-4">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-[#2c5f51]">{c.title}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#e6f2ec] text-[#3d6b5c]">
                        {formatPublicEnum(c.status)}
                      </span>
                    </div>
                    <p className="text-sm soft-subtext">{c.description}</p>
                    <div className="h-2 rounded-full bg-[#2c5f51]/10 overflow-hidden">
                      <div className="h-full bg-[#f6931d] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-sm text-[#3d6b5c]">
                      <strong>{formatVnd(c.raised_amount)}</strong>
                      <span className="soft-subtext"> of {formatVnd(c.target_amount)} ({pct}%)</span>
                    </p>
                    <Button
                      type="button"
                      className="rounded-full bg-[#f6931d] hover:bg-orange-600 w-full"
                      onClick={() => {
                        setSelectedCampaign(c.campaign_id);
                        setTab("money");
                      }}
                      disabled={c.status === "COMPLETED"}
                    >
                      Support this campaign
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {tab === "money" ? (
            moneyDone ? (
              <div className="soft-card p-10 text-center space-y-3">
                <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
                <p className="font-bold text-[#2c5f51]">Thank you for your gift!</p>
                <p className="text-sm soft-subtext">PayPal payment preview — status PENDING until API connects.</p>
                <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={() => setMoneyDone(false)}>
                  Donate again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMoney} className="soft-card p-6 md:p-8 space-y-5 max-w-xl mx-auto">
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Campaign</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(Number(e.target.value))}
                    className={`${fieldClass} flex h-10 w-full px-3 text-sm`}
                  >
                    {campaigns.filter((c) => c.status !== "COMPLETED").map((c) => (
                      <option key={c.campaign_id} value={c.campaign_id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Your name</label>
                  <Input
                    name="donorName"
                    required
                    defaultValue={user?.fullName}
                    placeholder="Donor name"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5a6b60] mb-2">Amount</p>
                  <div className="flex flex-wrap gap-2">
                    {donationQuickAmounts.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setAmount(a);
                          setCustomAmount("");
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                          amount === a && !customAmount
                            ? "bg-[#2c5f51] text-white border-[#2c5f51]"
                            : "bg-white border-[#2c5f51]/10 text-[#5a6b60] hover:border-[#f6931d]/30"
                        )}
                      >
                        {formatVnd(a)}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min={10000}
                    placeholder="Custom amount (₫)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className={cn(fieldClass, "mt-3")}
                  />
                </div>
                <Button type="submit" className="w-full rounded-full bg-[#2c5f51] hover:bg-[#3d6b5c] h-12 font-bold">
                  Donate via PayPal (preview)
                </Button>
              </form>
            )
          ) : null}

          {tab === "items" ? (
            itemDone ? (
              <div className="soft-card p-10 text-center space-y-3">
                <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
                <p className="font-bold text-[#2c5f51]">Item donation registered</p>
                <p className="text-sm soft-subtext">Our team will contact you about drop-off or pickup.</p>
              </div>
            ) : (
              <form onSubmit={handleItem} className="soft-card p-6 md:p-8 space-y-4 max-w-xl mx-auto">
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Your name</label>
                  <Input name="donorName" required defaultValue={user?.fullName} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Item name</label>
                  <Input name="itemName" required placeholder="e.g. Dry dog food 15kg" className={fieldClass} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Category</label>
                    <select name="category" required className={`${fieldClass} flex h-10 w-full px-3 text-sm`}>
                      {itemDonationCategories.map((c) => (
                        <option key={c} value={c}>
                          {formatPublicEnum(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Quantity</label>
                    <Input name="quantity" required placeholder="e.g. 2 bags" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Note (optional)</label>
                  <Textarea name="note" placeholder="Brand, expiry, pickup time..." className={fieldClass} />
                </div>
                <Button type="submit" className="w-full rounded-full bg-[#2c5f51] h-11 font-bold">
                  Register item donation
                </Button>
              </form>
            )
          ) : null}

          <p className="text-center text-sm soft-subtext mt-10">
            Merch lover?{" "}
            <Link to="/shop" className="text-[#f6931d] font-medium hover:underline">
              Visit our support shop →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
