import { useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  adminDashboardStats,
  getCampaignTitle,
  mockDonationCampaigns,
  mockDonations,
  mockItemDonations,
} from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";

export function AdminDonationsPage() {
  const [tab, setTab] = useState("financial");
  const total = adminDashboardStats.donations.totalVnd;

  return (
    <div>
      <AdminPageHeader
        title="Donations"
        description="Financial gifts, item donations, and linked campaigns."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Total raised</p>
          <p className="mt-1 text-2xl font-semibold text-white">{total.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Transactions</p>
          <p className="mt-1 text-2xl font-semibold text-white">{adminDashboardStats.donations.count}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Pending payments</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">
            {mockDonations.filter((d) => d.payment_status === "PENDING").length}
          </p>
        </div>
      </div>

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "financial", label: "Financial" },
          { id: "items", label: "Item donations" },
          { id: "campaigns", label: "Campaigns" },
        ]}
        className="mb-6"
      />

      {tab === "financial" ? (
        <AdminDataTable
          rows={mockDonations.map((d) => ({
            id: d.donation_id,
            donor: d.donor_name,
            campaign: getCampaignTitle(d.campaign_id),
            amount: d.amount.toLocaleString("vi-VN") + " ₫",
            type: d.donation_type,
            method: d.payment_method,
            status: d.payment_status,
            date: d.received_at,
          }))}
          columns={[
            { key: "id", label: "ID" },
            { key: "donor", label: "Donor" },
            { key: "campaign", label: "Campaign" },
            { key: "amount", label: "Amount" },
            { key: "type", label: "Type" },
            { key: "method", label: "Method" },
            { key: "status", label: "Status" },
            { key: "date", label: "Date" },
          ]}
        />
      ) : null}

      {tab === "items" ? (
        <div className="space-y-4">
          {mockItemDonations.map((item) => (
            <AdminPanel key={item.item_donation_id} title={item.item_name}>
              <AdminFieldGrid cols={3}>
                <AdminField label="Donor" value={item.donor_name} />
                <AdminField label="Category" value={formatEnum(item.category)} />
                <AdminField label="Quantity" value={item.quantity} />
                <AdminField label="Status" value={<StatusBadge value={item.status} />} />
                <AdminField label="Received by" value={item.received_by ?? "—"} />
                <AdminField label="Date" value={item.received_at} />
              </AdminFieldGrid>
              <AdminField label="Note" value={item.note} className="mt-3" />
            </AdminPanel>
          ))}
        </div>
      ) : null}

      {tab === "campaigns" ? (
        <div className="grid md:grid-cols-2 gap-4">
          {mockDonationCampaigns.map((c) => {
            const pct = Math.round((c.raised_amount / c.target_amount) * 100);
            return (
              <AdminPanel key={c.campaign_id} title={c.title}>
                <AdminFieldGrid>
                  <AdminField label="Status" value={<StatusBadge value={c.status} />} />
                  <AdminField label="Period" value={`${c.start_date} → ${c.end_date}`} />
                  <AdminField label="Target" value={`${c.target_amount.toLocaleString()} ₫`} />
                  <AdminField label="Raised" value={`${c.raised_amount.toLocaleString()} ₫ (${pct}%)`} />
                </AdminFieldGrid>
                <div className="admin-progress-track mt-4 h-2">
                  <div className="h-full bg-[#f6931d]" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </AdminPanel>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
