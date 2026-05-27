import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockAdminPets, mockKennels } from "@/data/admin-mock";
import {
  getKennelOccupancy,
  loadAdminPets,
  loadKennels,
  saveKennelRecord,
  type AdminPetRow,
} from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { staffIsAdmin } from "@/lib/admin/admin-role";
import { formatEnum } from "@/lib/adminFormat";

export function AdminKennelsPage() {
  const canEdit = staffIsAdmin();
  const [kennels, setKennels] = useState(mockKennels);
  const [pets, setPets] = useState<AdminPetRow[]>(mockAdminPets as AdminPetRow[]);
  const [selectedId, setSelectedId] = useState(mockKennels[0]?.kennel_id ?? 1);

  useEffect(() => {
    void loadAdminPets().then(setPets);
    void loadKennels().then((list) => {
      setKennels(list);
      setSelectedId((prev) => prev ?? list[0]?.kennel_id ?? 1);
    });
  }, []);

  const selected = kennels.find((k) => k.kennel_id === selectedId);
  const petsInKennel = pets.filter((p) => p.kennel_id === selectedId);
  const [editForm, setEditForm] = useState({ name: "", capacity: 0, description: "" });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setEditForm({
        name: selected.name,
        capacity: selected.capacity,
        description: selected.description,
      });
    }
  }, [selected?.kennel_id]);

  const refresh = () => {
    void loadKennels().then(setKennels);
    void loadAdminPets().then(setPets);
  };

  const handleSaveKennel = () => {
    if (!selected) return;
    if (USE_MOCK) {
      setSaveMsg("Saved locally (mock mode).");
      return;
    }
    void saveKennelRecord({ ...selected, ...editForm })
      .then(() => {
        setSaveMsg("Kennel updated.");
        refresh();
      })
      .catch((e) => setSaveMsg(e instanceof ApiError ? e.message : "Save failed"));
  };

  return (
    <div>
      <AdminPageHeader
        title="Kennels"
        description="Capacity, occupancy, and pets assigned to each area."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {kennels.map((k) => {
            const occupied = getKennelOccupancy(k.kennel_id);
            const pct = Math.round((occupied / k.capacity) * 100);
            return (
              <button
                key={k.kennel_id}
                type="button"
                onClick={() => setSelectedId(k.kennel_id)}
                className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                  selectedId === k.kennel_id
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
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {selected ? (
          <div className="lg:col-span-2 space-y-4">
            <AdminPanel title={selected.name}>
              <AdminFieldGrid>
                <AdminField label="Capacity" value={selected.capacity} />
                <AdminField label="Occupied" value={getKennelOccupancy(selected.kennel_id)} />
                <AdminField label="Description" value={selected.description} />
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

            {canEdit ? (
              <AdminPanel title="Edit kennel">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className={adminInputClass("mt-1")}
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
                <button
                  type="button"
                  onClick={handleSaveKennel}
                  className="admin-btn-primary mt-4 text-sm"
                >
                  Save kennel
                </button>
                {saveMsg ? <p className="text-xs text-slate-400 mt-2">{saveMsg}</p> : null}
              </AdminPanel>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
