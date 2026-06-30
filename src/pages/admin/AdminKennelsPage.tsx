import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockAdminPets } from "@/data/admin-mock";
import { getKennelOccupancy, loadAdminPets, type AdminPetRow } from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { staffIsAdmin } from "@/lib/admin/admin-role";
import { formatEnum } from "@/lib/adminFormat";
import { fetchKennels, createKennel, updateKennel, deleteKennel, type KennelResDto } from "@/lib/api/kennels-api";

export function AdminKennelsPage() {
  const canEdit = staffIsAdmin();
  const [kennels, setKennels] = useState<KennelResDto[]>([]);
  const [pets, setPets] = useState<AdminPetRow[]>(mockAdminPets as AdminPetRow[]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [editForm, setEditForm] = useState({ name: "", capacity: 1, description: "" });
  const [isCreating, setIsCreating] = useState(false); // Trạng thái form tạo mới
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Hàm load data từ API hoặc Mock
  const refresh = () => {
    void loadAdminPets().then(setPets);
    void fetchKennels()
      .then((list) => {
        setKennels(list);
        // Nếu chưa chọn kennel nào, mặc định chọn cái đầu tiên
        setSelectedId((prev) => prev ?? list[0]?.kennelId ?? null);
      })
      .catch((e) => {
        setSaveMsg(e instanceof ApiError ? e.message : "Failed to load kennels");
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const selected = kennels.find((k) => k.kennelId === selectedId);
  const petsInKennel = pets.filter((p) => p.kennel_id === selectedId); // Giữ nguyên mapping với pet data

  // Điền dữ liệu vào form edit khi thay đổi kennel được chọn
  useEffect(() => {
    if (selected && !isCreating) {
      setEditForm({
        name: selected.name,
        capacity: selected.capacity,
        description: selected.description ?? "",
      });
      setSaveMsg(null);
    }
  }, [selectedId, isCreating]);

  // Xử lý Lưu (Tạo mới hoặc Cập nhật)
  const handleSaveKennel = () => {
    if (USE_MOCK) {
      setSaveMsg("Saved locally (mock mode).");
      return;
    }

    if (isCreating) {
      void createKennel(editForm)
        .then((newKennel) => {
          setSaveMsg("Kennel created successfully.");
          setIsCreating(false);
          setSelectedId(newKennel.kennelId);
          refresh();
        })
        .catch((e) => setSaveMsg(e instanceof ApiError ? e.message : "Create failed"));
    } else {
      if (!selectedId) return;
      void updateKennel(selectedId, editForm)
        .then(() => {
          setSaveMsg("Kennel updated successfully.");
          refresh();
        })
        .catch((e) => setSaveMsg(e instanceof ApiError ? e.message : "Update failed"));
    }
  };

  // Xử lý Xóa kennel
  const handleDeleteKennel = () => {
    if (!selectedId || !window.confirm("Are you sure you want to delete this kennel?")) return;

    if (USE_MOCK) {
      setSaveMsg("Deleted locally (mock mode).");
      return;
    }

    void deleteKennel(selectedId)
      .then(() => {
        setSaveMsg("Kennel deleted.");
        setSelectedId(null);
        refresh();
      })
      .catch((e) => setSaveMsg(e instanceof ApiError ? e.message : "Delete failed"));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AdminPageHeader
          title="Kennels"
          description="Capacity, occupancy, and pets assigned to each area."
        />
        {canEdit && (
          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedId(null);
              setEditForm({ name: "", capacity: 1, description: "" });
            }}
            className="admin-btn-primary text-sm h-fit py-2 px-4"
          >
            + Add New Kennel
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SIDEBAR: Danh sách Kennels */}
        <div className="space-y-3">
          {kennels.map((k) => {
            const occupied = getKennelOccupancy(k.kennelId);
            const pct = k.capacity > 0 ? Math.round((occupied / k.capacity) * 100) : 0;
            return (
              <button
                key={k.kennelId}
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setSelectedId(k.kennelId);
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                  selectedId === k.kennelId && !isCreating
                    ? "border-[#2c5f51]/50 bg-[#2c5f51]/15 shadow-lg shadow-[#2c5f51]/10"
                    : "admin-card hover:border-[#f6931d]/20"
                }`}
              >
                <p className="font-medium text-white">{k.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {occupied}/{k.capacity} · {pct}% full
                </p>
                <div className="admin-progress-track mt-2 h-1.5">
                  <div
                    className={`h-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN PANEL: Chi tiết & Form chỉnh sửa */}
        <div className="lg:col-span-2 space-y-4">
          {selected && !isCreating && (
            <>
              <AdminPanel title={selected.name}>
                <AdminFieldGrid>
                  <AdminField label="Capacity" value={selected.capacity} />
                  <AdminField label="Occupied" value={getKennelOccupancy(selected.kennelId)} />
                  <AdminField label="Description" value={selected.description || "No description"} />
                </AdminFieldGrid>
              </AdminPanel>

              <AdminPanel title={`Pets in ${selected.name} (${petsInKennel.length})`}>
                {petsInKennel.length === 0 ? (
                  <p className="text-sm text-slate-500">No pets assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {petsInKennel.map((p) => (
                      <Link
                        key={p.pet_id}
                        to={`/admin/pets/${p.pet_id}`}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-[#f6931d]/15 hover:bg-white/[0.05]"
                      >
                        <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatEnum(p.species)} · {formatEnum(p.status)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </AdminPanel>
            </>
          )}

          {/* Form Create / Edit */}
          {canEdit && (selected || isCreating) && (
            <AdminPanel title={isCreating ? "Create New Kennel" : "Edit kennel"}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className={adminInputClass("mt-1")}
                    placeholder="e.g. Area A"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.capacity}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, capacity: Number(e.target.value) || 1 }))
                    }
                    className={adminInputClass("mt-1")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className={adminInputClass("mt-1 min-h-[80px]")}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleSaveKennel}
                  className="admin-btn-primary text-sm"
                >
                  {isCreating ? "Create kennel" : "Save kennel"}
                </button>

                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleDeleteKennel}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl transition-colors text-sm"
                  >
                    Delete Kennel
                  </button>
                )}
              </div>
              
              {saveMsg && <p className="text-xs text-slate-400 mt-2">{saveMsg}</p>}
            </AdminPanel>
          )}
        </div>
      </div>
    </div>
  );
}