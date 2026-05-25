import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getKennelOccupancy, mockAdminPets, mockKennels } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";

export function AdminKennelsPage() {
  const [selectedId, setSelectedId] = useState(mockKennels[0]?.kennel_id ?? 1);
  const selected = mockKennels.find((k) => k.kennel_id === selectedId);
  const petsInKennel = mockAdminPets.filter((p) => p.kennel_id === selectedId);

  return (
    <div>
      <AdminPageHeader
        title="Kennels"
        description="Capacity, occupancy, and pets assigned to each area."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {mockKennels.map((k) => {
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

            <AdminPanel title="Edit kennel (preview)">
              <AdminFieldGrid>
                <AdminField label="Name" value={selected.name} />
                <AdminField label="Capacity" value={selected.capacity} />
              </AdminFieldGrid>
              <p className="text-xs text-slate-500 mt-3">Save will connect to API.</p>
            </AdminPanel>
          </div>
        ) : null}
      </div>
    </div>
  );
}
