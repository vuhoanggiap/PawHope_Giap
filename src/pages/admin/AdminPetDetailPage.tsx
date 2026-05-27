import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  mockAdminPets,
  mockKennels,
  mockPetMedicalRecords,
  mockPetStatusLogs,
  mockRescueReports,
} from "@/data/admin-mock";
import {
  loadAdminPets,
  loadKennels,
  loadPetMedicalRecords,
  loadPetStatusLogs,
  loadRescueReports,
  type AdminPetRow,
  type AdminRescueRow,
} from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft } from "lucide-react";

export function AdminPetDetailPage() {
  const { id } = useParams();
  const petId = Number(id);
  const [pet, setPet] = useState<AdminPetRow | undefined>(() =>
    mockAdminPets.find((p) => p.pet_id === petId) as AdminPetRow | undefined
  );
  const [kennels, setKennels] = useState(mockKennels);
  const [medical, setMedical] = useState(() =>
    mockPetMedicalRecords.filter((m) => m.pet_id === petId)
  );
  const [logs, setLogs] = useState(() => mockPetStatusLogs.filter((l) => l.pet_id === petId));
  const [rescues, setRescues] = useState<AdminRescueRow[]>(
    mockRescueReports as AdminRescueRow[]
  );
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    setLoading(true);
    void Promise.all([
      loadAdminPets(),
      loadKennels(),
      loadRescueReports(),
      loadPetMedicalRecords(petId),
      loadPetStatusLogs(petId),
    ]).then(([pets, kennelList, rescueList, medicalList, logList]) => {
      setPet(pets.find((p) => p.pet_id === petId));
      setKennels(kennelList);
      setRescues(rescueList);
      setMedical(medicalList);
      setLogs(logList);
      setLoading(false);
    });
  }, [petId]);

  if (loading) {
    return <p className="text-center py-16 text-slate-400">Loading pet…</p>;
  }

  if (!pet) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Pet not found.</p>
        <Link to="/admin/pets" className="text-[#f6931d] text-sm mt-4 inline-block">
          ← Back to pets
        </Link>
      </div>
    );
  }

  const rescue = pet.from_report_id
    ? rescues.find((r) => r.report_id === pet.from_report_id)
    : null;

  return (
    <div>
      <Link to="/admin/pets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to pets
      </Link>

      <AdminPageHeader
        title={`${pet.name} (${pet.pet_code})`}
        description={pet.description}
      />

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <img
          src={pet.image_url}
          alt={pet.name}
          className="w-full lg:w-72 h-56 object-cover rounded-xl border border-slate-800 shrink-0"
        />
        <div className="flex flex-wrap gap-2 items-start">
          <StatusBadge value={pet.status} />
          <StatusBadge value={pet.health_status} />
          {pet.personality.map((p) => (
            <span key={p} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300 ring-1 ring-white/[0.06]">
              {formatEnum(p)}
            </span>
          ))}
        </div>
      </div>

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "medical", label: `Medical (${medical.length})` },
          { id: "logs", label: `Status log (${logs.length})` },
        ]}
        className="mb-6"
      />

      {tab === "profile" ? (
        <AdminPanel title="Pet profile">
          <AdminFieldGrid cols={3}>
            <AdminField label="Species" value={formatEnum(pet.species)} />
            <AdminField label="Breed" value={pet.breed} />
            <AdminField label="Gender" value={formatEnum(pet.gender)} />
            <AdminField label="Age" value={`${pet.age_months} months`} />
            <AdminField label="Weight" value={`${pet.weight_kg} kg`} />
            <AdminField label="Intake date" value={pet.intake_date} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Kennel</p>
              <select
                value={pet.kennel_id ?? ""}
                onChange={(e) => setPet({ ...pet, kennel_id: Number(e.target.value) })}
                className={adminInputClass()}
              >
                {kennels.map((k) => (
                  <option key={k.kennel_id} value={k.kennel_id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Adoption status</p>
              <select
                value={pet.status}
                onChange={(e) => setPet({ ...pet, status: e.target.value })}
                className={adminInputClass()}
              >
                {[
                  "NOT_READY_FOR_ADOPTION",
                  "AVAILABLE_FOR_ADOPTION",
                  "PENDING_ADOPTION",
                  "ADOPTED",
                  "DECEASED",
                ].map((s) => (
                  <option key={s} value={s}>
                    {formatEnum(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Health status</p>
              <select
                value={pet.health_status}
                onChange={(e) => setPet({ ...pet, health_status: e.target.value })}
                className={adminInputClass()}
              >
                {["HEALTHY", "VACCINATED", "STERILIZED", "UNDER_TREATMENT", "SPECIAL_NEEDS"].map((s) => (
                  <option key={s} value={s}>
                    {formatEnum(s)}
                  </option>
                ))}
              </select>
            </div>
            <AdminField
              label="From rescue"
              value={
                rescue ? (
                  <Link to="/admin/rescue" className="text-[#f6931d] hover:underline">
                    {rescue.tracking_code}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </AdminFieldGrid>
          <AdminField label="Description" value={pet.description} className="mt-4" />
        </AdminPanel>
      ) : null}

      {tab === "medical" ? (
        <div className="space-y-4">
          <AdminPanel title="Add medical record (preview)">
            <p className="text-sm text-slate-500 mb-3">Form will connect to API — fields match schema.</p>
            <AdminFieldGrid cols={3}>
              <AdminField label="Type" value="VACCINATION / DEWORMING / TREATMENT / …" />
              <AdminField label="Record date" value="—" />
              <AdminField label="Next due date" value="—" />
            </AdminFieldGrid>
          </AdminPanel>
          {medical.map((m) => (
            <AdminPanel key={m.medical_id} title={formatEnum(m.record_type)}>
              <AdminFieldGrid cols={3}>
                <AdminField label="Date" value={m.record_date} />
                <AdminField label="Next due" value={m.next_due_date ?? "—"} />
                <AdminField label="Recorded by" value={m.created_by} />
              </AdminFieldGrid>
              <AdminField label="Description" value={m.description} className="mt-3" />
            </AdminPanel>
          ))}
          {medical.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No medical records yet.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "logs" ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.log_id} className="admin-card p-4">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <StatusBadge value={log.old_status ?? "NOT_READY_FOR_ADOPTION"} />
                <span className="text-slate-500">→</span>
                <StatusBadge value={log.new_status} />
              </div>
              <p className="text-sm text-slate-300">{log.note}</p>
              <p className="text-xs text-slate-500 mt-2">
                {log.updated_by} · {log.updated_at}
              </p>
            </div>
          ))}
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No status changes logged.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
