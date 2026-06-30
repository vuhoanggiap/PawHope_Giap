import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { createPaypalOrder, capturePaypalDonation } from "@/lib/api/paypal-api";
import { fetchPublicCampaigns, createItemDonation } from "@/lib/api/donations-api";
import { fetchOrganizationInfo } from "@/lib/api/organization-api";
import { donationQuickAmounts, formatPublicEnum, itemDonationCategories } from "@/data/public-mock";
import type { DonationCampaign } from "@/data/public-mock";
import { formatVnd } from "@/lib/formatVnd";
import { cn } from "@/lib/utils";
import { CheckCircle2, Gift, Heart, Package } from "lucide-react";

type Tab = "money" | "items" | "campaigns";

export function DonatePage() {
  const { user } = usePublicAuth();
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<number>(0);
  const [amount, setAmount] = useState(200_000);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [moneyDone, setMoneyDone] = useState(false);
  const [itemDone, setItemDone] = useState(false);
  const [orgInfo, setOrgInfo] = useState<any | null>(null);

  useEffect(() => {
    fetchPublicCampaigns()
      .then((data) => {
        setCampaigns(data);
        const ongoing = data.find((c) => c.status === "ONGOING");
        if (ongoing) setSelectedCampaign(ongoing.campaign_id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingCampaigns(false));

    fetchOrganizationInfo()
      .then((data) => {
        if (data) {
          setOrgInfo(data); 
        }
      })
      .catch((err) => console.error("Failed to fetch organization info:", err));
  }, []);

  useEffect(() => {
    if (user) {
      setDonorName(user.fullName || "");
    }
  }, [user]);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleItemSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createItemDonation({
        userId: user?.userId,
        donorNameManual: String(fd.get("donorName") || "Anonymous"),
        itemName: String(fd.get("itemName") || ""),
        category: String(fd.get("category") || "OTHER"),
        quantity: String(fd.get("quantity") || ""),
        note: String(fd.get("note") || "") || undefined,
      });
      setItemDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to register item donation. Please try again.");
    }
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
            loadingCampaigns ? (
              <div className="text-center py-8 soft-subtext">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 soft-subtext">No active campaigns at the moment.</div>
            ) : (
              <div className="public-card-grid md:grid-cols-2">
                {campaigns.map((c) => {
                  const pct = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100)) || 0;
                  return (
                    <div key={c.campaign_id} className="soft-card p-6 space-y-4">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-[#2c5f51]">{c.title}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#e6f2ec] text-[#3d6b5c]">
                          {formatPublicEnum(c.status)}
                        </span>
                      </div>
                      <p className="text-sm soft-subtext line-clamp-3">{c.description}</p>
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
                        disabled={c.status === "COMING_SOON" || c.status === "COMPLETED" || c.status === "CANCELLED"}
                      >
                        {c.status === "COMING_SOON" ? "Coming Soon" : "Support this campaign"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}

          {tab === "money" ? (
            moneyDone ? (
              <div className="soft-card p-10 text-center space-y-3 max-w-xl mx-auto">
                <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
                <p className="font-bold text-[#2c5f51]">Thank you for your generous gift!</p>
                <p className="text-sm soft-subtext">Your financial donation has been processed successfully via PayPal.</p>
                <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={() => setMoneyDone(false)}>
                  Donate again
                </Button>
              </div>
            ) : (
              <div className="soft-card p-6 md:p-8 space-y-5 max-w-xl mx-auto">
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Select Campaign</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(Number(e.target.value))}
                    className={`${fieldClass} flex h-10 w-full px-3 text-sm rounded-xl border`}
                  >
                    {campaigns.filter((c) => c.status === "ONGOING" || c.status === "COMING_SOON").map((c) => (
                      <option key={c.campaign_id} value={c.campaign_id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Your Name (Display)</label>
                  <Input
                    value={donorName}
                    required
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your name or Anonymous"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5a6b60] mb-2">Select Amount</p>
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
                    min={25000}
                    placeholder="Custom amount (₫)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className={cn(fieldClass, "mt-3")}
                  />
                </div>

                <div className="pt-4 border-t border-dashed">
                  <p className="text-xs text-center text-gray-400 mb-3">
                    Total: <strong className="text-[#2c5f51] text-sm">{formatVnd(finalAmount)}</strong> (~${(finalAmount / 25000).toFixed(2)} USD)
                  </p>
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "pill", label: "donate" }}
                    forceReRender={[finalAmount, selectedCampaign, donorName]}
                    createOrder={async () => {
                      const amountUsd = Number((finalAmount / 25000).toFixed(2));
                      const paypalOrder = await createPaypalOrder(amountUsd);
                      return paypalOrder.id;
                    }}
                    onApprove={async (data) => {
                      if (!data.orderID) return;

                      await capturePaypalDonation(data.orderID, {
                        campaignId: selectedCampaign,
                        userId: user?.userId || null,
                        donorNameManual: donorName || "Guest",
                        amount: finalAmount 
                      });
                      
                      setMoneyDone(true);
                    }}
                    onError={(err) => {
                      console.error(err);
                      alert("Payment failed. Please try again.");
                    }}
                  />
                </div>
              </div>
            )
          ) : null}

          {tab === "items" ? (
            itemDone ? (
              <div className="soft-card p-6 md:p-10 text-center space-y-4 max-w-xl mx-auto border border-emerald-100 bg-emerald-50/30">
                <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
                
                <div className="space-y-1">
                  <p className="font-bold text-xl text-[#2c5f51]">Item donation registered!</p>
                  <p className="text-sm soft-subtext px-4">
                    Thank you for your support. You can send your donated items to our rescue center using the information below:
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 text-left border border-[#2c5f51]/10 space-y-2.5 shadow-sm">
                  <p className="text-sm text-gray-700">
                    <strong className="text-[#2c5f51]">Address: </strong> 
                    {orgInfo?.address || "Loading center address..."}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong className="text-[#2c5f51]">Hotline: </strong> 
                    {orgInfo?.hotline || "Loading hotline..."} 
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong className="text-[#2c5f51]">Email: </strong> 
                    {orgInfo?.email || "Loading email..."}
                  </p>
                  
                  <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200/60 leading-relaxed mt-2">
                    * Note: If you are using a delivery service, please include our Hotline number so our coordinators can receive your package promptly.
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2 rounded-full border-[#2c5f51]/20 hover:bg-white text-[#2c5f51]" 
                  onClick={() => setItemDone(false)}
                >
                  Register another item
                </Button>
              </div>
            ) : (
              <form onSubmit={handleItemSubmit} className="soft-card p-6 md:p-8 space-y-4 max-w-xl mx-auto">
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Your name</label>
                  <Input name="donorName" required defaultValue={user?.fullName || "Ẩn danh"} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a6b60]">Item name</label>
                  <Input name="itemName" required placeholder="e.g. Dry dog food 15kg" className={fieldClass} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Category</label>
                    <select name="category" required className={`${fieldClass} flex h-10 w-full px-3 text-sm rounded-xl border`}>
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
                <Button type="submit" className="w-full rounded-full bg-[#2c5f51] hover:bg-[#1d4137] h-11 font-bold text-white">
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