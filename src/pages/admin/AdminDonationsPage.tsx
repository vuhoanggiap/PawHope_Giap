import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockDonations } from "@/data/admin-mock";
import { getCampaignTitle, loadDonations } from "@/lib/admin/admin-data";
import { fetchDonationCampaigns, updateCampaign, createCampaign, deleteCampaign } from "@/lib/api/donation-campaigns-api";
import { fetchAllItemDonations, updateItemDonationStatus, } from "@/lib/api/item-donations-api";
import { formatEnum } from "@/lib/adminFormat";
import type { DonationCampaign, PublicItemDonation } from "@/data/public-mock";


export function AdminDonationsPage() {
  const [tab, setTab] = useState("financial");
  const [donations, setDonations] = useState(mockDonations);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [itemDonations, setItemDonations] = useState<PublicItemDonation[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editItemStatus, setEditItemStatus] = useState("");
  const [itemPage, setItemPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const [campaignPage, setCampaignPage] = useState(1);

  const CAMPAIGNS_PER_PAGE = 10;

  const sortedItemDonations = [...itemDonations].sort(
    (a, b) => b.item_donation_id - a.item_donation_id
  );

  const pagedItemDonations = sortedItemDonations.slice(
    (itemPage - 1) * ITEMS_PER_PAGE,
    itemPage * ITEMS_PER_PAGE
  );

  const selectedItem = itemDonations.find(
    (i) => i.item_donation_id === selectedItemId
  );

  const sortedCampaigns = [...campaigns].sort(
    (a, b) => b.campaign_id - a.campaign_id
  );

  const pagedCampaigns = sortedCampaigns.slice(
    (campaignPage - 1) * CAMPAIGNS_PER_PAGE,
    campaignPage * CAMPAIGNS_PER_PAGE
  );

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const selectedCampaign = campaigns.find(
    (c) => c.campaign_id === selectedCampaignId
  );
  const refreshItemDonations = async () => {
    const list = await fetchAllItemDonations();

    setItemDonations(list);

    if (selectedItemId) {
      const item = list.find(
        (i) => i.item_donation_id === selectedItemId
      );

      if (item) {
        setEditItemStatus(item.status);
      }
    }
  };

  const refreshCampaigns = async () => {
    const list = await fetchDonationCampaigns();

    setCampaigns(list);

    if (selectedCampaignId) {
      const c = list.find(
        x => x.campaign_id === selectedCampaignId
      );

      if (c) {
        setEditCampaign({ ...c });
      }
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Delete this campaign?")) return;

    try {
      await deleteCampaign(id);
      refreshCampaigns();
    } catch {
      alert("Delete failed");
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editCampaign) return;

    try {
      await updateCampaign(editCampaign.campaign_id, {
        title: editCampaign.title,
        description: editCampaign.description,
        targetAmount: editCampaign.target_amount,
        startDate: editCampaign.start_date,
        endDate: editCampaign.end_date,
        status: editCampaign.status,
      });

      await refreshCampaigns();
      setSelectedCampaignId(editCampaign.campaign_id);

      alert("Campaign updated");
    } catch {
      alert("Update failed");
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await createCampaign(newCampaign);

      await refreshCampaigns();

      setCreating(false);

      setNewCampaign({
        title: "",
        description: "",
        targetAmount: 0,
        startDate: "",
        endDate: "",
        status: "COMING_SOON",
      });

      alert("Campaign created");
    } catch {
      alert("Create failed");
    }
  };

  const [editCampaign, setEditCampaign] =
  useState<DonationCampaign | null>(null);

  const [creating, setCreating] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    targetAmount: 0,
    startDate: "",
    endDate: "",
    status: "COMING_SOON",
  });

  const handleUpdateItemStatus = async () => {
    if (!selectedItem) return;

    if (editItemStatus === selectedItem.status) {
      alert("Status has not changed.");
      return;
    }

    const ok = confirm(
      `Change status from ${selectedItem.status} to ${editItemStatus}?`
    );

    if (!ok) return;

    try {
      await updateItemDonationStatus(
        selectedItem.item_donation_id,
        editItemStatus
      );

      await refreshItemDonations();

      setEditItemStatus(editItemStatus);

      alert("Status updated");
    } catch {
      alert("Update failed");
    }
  };

  useEffect(() => {
    void loadDonations().then(setDonations);
    void fetchDonationCampaigns().then(setCampaigns);
    void fetchAllItemDonations().then(setItemDonations);
  }, []);

  const total = donations.reduce((s, d) => s + d.amount, 0);

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
          <p className="mt-1 text-2xl font-semibold text-white">{donations.length}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Pending payments</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">
            {donations.filter((d) => d.payment_status === "PENDING").length}
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
          rows={donations.map((d) => ({
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
            { key: "date", label: "Received at" },
          ]}
        />
      ) : null}

      {tab === "items" && (
        <div className="grid xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <AdminDataTable
              rows={pagedItemDonations.map((i) => ({
                id: i.item_donation_id,
                donor: i.donor_name,
                item: i.item_name,
                status: i.status,
                __id: i.item_donation_id,
              }))}
              columns={[
                { key: "id", label: "ID" },
                { key: "donor", label: "Donor" },
                { key: "item", label: "Item" },
                { key: "status", label: "Status" },
              ]}
              onRowClick={(row) => {
                const item = itemDonations.find(
                  (i) => i.item_donation_id === row.__id
                );

                setSelectedItemId(row.__id as number);

                if (item) {
                  setEditItemStatus(item.status);
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={itemPage === 1}
                onClick={() => setItemPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1">
                {itemPage}
              </span>

              <button
                disabled={
                  itemPage >= Math.ceil(sortedItemDonations.length / ITEMS_PER_PAGE)
                }
                onClick={() => setItemPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="xl:col-span-3">
            {!selectedItem ? (
              <AdminPanel title="Item donation">
                <p>Select an item donation.</p>
              </AdminPanel>
            ) : (
              <AdminPanel title={selectedItem.item_name}>
                <AdminFieldGrid cols={3}>
                  <AdminField label="Donor" value={selectedItem.donor_name} />
                  <AdminField label="Category" value={formatEnum(selectedItem.category)} />
                  <AdminField label="Quantity" value={selectedItem.quantity} />
                  <AdminField label="Received by" value={selectedItem.received_by ?? "—"} />
                  <AdminField label="Date" value={selectedItem.received_at} />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <select
                      value={editItemStatus}
                      onChange={(e) => setEditItemStatus(e.target.value)}
                      className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    >
                      <option
                        value="PENDING"
                        disabled={selectedItem.status !== "PENDING"}
                      >
                        Pending
                      </option>

                      <option
                        value="RECEIVED"
                        disabled={selectedItem.status === "USED"}
                      >
                        Received
                      </option>

                      <option value="USED">
                        Used
                      </option>
                    </select>
                  </div>
                </AdminFieldGrid>

                <AdminField
                  label="Note"
                  value={selectedItem.note ?? "—"}
                  className="mt-4"
                />
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleUpdateItemStatus}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Save Status
                  </button>
                </div>
              </AdminPanel>
            )}
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="grid xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setCreating(true)}
                className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
              >
                + New Campaign
              </button>
            </div>
            <AdminDataTable
              rows={pagedCampaigns.map((c) => ({
                id: c.campaign_id,
                title: c.title,
                target: c.target_amount.toLocaleString(),
                status: c.status,
                __id: c.campaign_id,
              }))}
              columns={[
                { key: "id", label: "ID" },
                { key: "title", label: "Title" },
                { key: "target", label: "Target" },
                { key: "status", label: "Status" },
              ]}
              onRowClick={(row) => {
                const c = campaigns.find(
                  (x) => x.campaign_id === row.__id
                );

                setSelectedCampaignId(row.__id as number);

                if (c) {
                  setEditCampaign({ ...c });
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={campaignPage === 1}
                onClick={() => setCampaignPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1">
                {campaignPage}
              </span>

              <button
                disabled={
                  campaignPage >=
                  Math.ceil(sortedCampaigns.length / CAMPAIGNS_PER_PAGE)
                }
                onClick={() => setCampaignPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="xl:col-span-3">
            {creating && (
              <AdminPanel title="Create Campaign">
                <div className="space-y-4">

                  <input
                    className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    placeholder="Title"
                    value={newCampaign.title}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        title: e.target.value,
                      })
                    }
                  />

                  <textarea
                    className="border border-slate-600 rounded px-3 py-2 w-full min-h-28 bg-slate-800 text-white"
                    placeholder="Description"
                    value={newCampaign.description}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        description: e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    placeholder="Target Amount"
                    value={newCampaign.targetAmount}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        targetAmount: Number(e.target.value),
                      })
                    }
                  />

                  <input
                    type="date"
                    className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    value={newCampaign.startDate}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        startDate: e.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    value={newCampaign.endDate}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        endDate: e.target.value,
                      })
                    }
                  />

                  <select
                    className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    value={newCampaign.status}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>

                  </select>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCreating(false)}
                      className="px-4 py-2 rounded bg-slate-600 text-white"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleCreateCampaign}
                      className="px-4 py-2 rounded bg-green-600 text-white"
                    >
                      Create
                    </button>
                  </div>
                  
                </div>
              </AdminPanel>
            )}
            {!selectedCampaign ? (
              <AdminPanel title="Campaign">
                <p className="text-sm text-slate-500">
                  Select a campaign.
                </p>
              </AdminPanel>
            ) : (
              <AdminPanel title={selectedCampaign.title}>
                <input
                  className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                  value={editCampaign?.title ?? ""}
                  onChange={(e)=>
                    setEditCampaign({
                      ...editCampaign!,
                      title:e.target.value
                    })
                  }
                />
                <AdminFieldGrid cols={2}>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Status
                    </p>

                    <select
                      value={editCampaign?.status ?? ""}
                      onChange={(e) => {
                        if (!editCampaign) return;

                        const nextStatus = e.target.value;

                        if (
                          confirm(
                            `Change status from ${editCampaign.status} to ${nextStatus}?`
                          )
                        ) {
                          setEditCampaign({
                            ...editCampaign,
                            status: nextStatus,
                          });
                        }
                      }}
                      className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                    >
                      <option
                        value="COMING_SOON"
                        disabled={editCampaign?.status !== "COMING_SOON"}
                      >
                        Coming Soon
                      </option>

                      <option
                        value="ONGOING"
                        disabled={
                          editCampaign?.status !== "COMING_SOON" &&
                          editCampaign?.status !== "ONGOING"
                        }
                      >
                        Ongoing
                      </option>

                      <option
                        value="COMPLETED"
                        disabled={editCampaign?.status !== "ONGOING"}
                      >
                        Completed
                      </option>

                      <option
                        value="CANCELLED"
                        disabled={
                          editCampaign?.status !== "COMING_SOON" &&
                          editCampaign?.status !== "CANCELLED"
                        }
                      >
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Start date
                    </p>

                    <input
                      type="date"
                      className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                      value={editCampaign?.start_date ?? ""}
                      onChange={(e)=>
                        setEditCampaign({
                          ...editCampaign!,
                          start_date:e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      End date
                    </p>
                    <input
                      type="date"
                      className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                      value={editCampaign?.end_date ?? ""}
                      onChange={(e)=>
                        setEditCampaign({
                          ...editCampaign!,
                          end_date:e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Target
                    </p>

                    <input
                      type="number"
                      className="border border-slate-600 rounded px-3 py-2 w-full bg-slate-800 text-white"
                      value={editCampaign?.target_amount ?? 0}
                      onChange={(e)=>
                        setEditCampaign({
                          ...editCampaign!,
                          target_amount:Number(e.target.value)
                        })
                      }
                    />
                  </div>

                  <AdminField
                    label="Raised"
                    value={`${selectedCampaign.raised_amount.toLocaleString()} ₫`}
                  />
                </AdminFieldGrid>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Progress
                  </p>

                  <div className="admin-progress-track h-2">
                    <div
                      className="h-full bg-[#f6931d]"
                      style={{
                        width: `${Math.min(
                          Math.round(
                            (selectedCampaign.raised_amount /
                              selectedCampaign.target_amount) *
                              100
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Description
                  </p>

                  <textarea
                    className="border border-slate-600 rounded px-3 py-2 w-full min-h-28 bg-slate-800 text-white placeholder:text-slate-400"
                    value={editCampaign?.description ?? ""}
                    onChange={(e) =>
                      setEditCampaign({
                        ...editCampaign!,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleUpdateCampaign}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Save
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteCampaign(selectedCampaign.campaign_id)
                    }
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </AdminPanel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
