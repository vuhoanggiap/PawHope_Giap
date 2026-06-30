import { useEffect, useState } from "react";
import { Link, useParams} from "react-router-dom";
import { AdminField, AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdminPets, mockKennels, mockPetMedicalRecords, mockPetStatusLogs, mockRescueReports } from "@/data/admin-mock";
import { loadAdminPets, loadKennels, loadPetMedicalRecords, loadPetStatusLogs, loadRescueReports,
  type AdminPetRow,
  type AdminRescueRow,
} from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { ArrowLeft, Save, Plus, Edit2, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getStaffUser } from "@/lib/admin/admin-role";

export function AdminPetDetailPage() {
  const { id } = useParams();
  const petId = Number(id);
  const staff = getStaffUser(); 
  const [pet, setPet] = useState<AdminPetRow | any>(() =>
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
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingMedical, setIsAddingMedical] = useState(false);
  const [newMedical, setNewMedical] = useState({
    recordType: "VACCINATION",
    recordDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    description: "",
  });
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({
    newStatus: "AVAILABLE_FOR_ADOPTION",
    note: "",
  });

  useEffect(() => {
    setLoading(true);
    void Promise.all([
      loadAdminPets(),
      loadKennels(),
      loadRescueReports(),
      loadPetMedicalRecords(petId),
      loadPetStatusLogs(petId),
    ]).then(([pets, kennelList, rescueList, medicalList, logList]) => {
      const currentPet = pets.find((p: any) => (p.pet_id || p.petId) === petId);
      setPet(currentPet);
      if (currentPet) setNewLog(prev => ({ ...prev, newStatus: currentPet.status }));
      setKennels(kennelList);
      setRescues(rescueList);
      setMedical(medicalList);
      setLogs(logList);
      setLoading(false);
    });
  }, [petId]);

  const handleSave = async () => {
    if (!pet) return;
    setIsSaving(true);
    const payload = {
      name: pet.name,
      petCode: pet.pet_code || pet.petCode,
      species: pet.species,
      gender: pet.gender,
      breed: pet.breed,
      ageMonths: pet.age_months || pet.ageMonths,
      weightKg: pet.weight_kg || pet.weightKg,
      healthStatus: pet.health_status || pet.healthStatus,
      personality: Array.isArray(pet.personality) ? pet.personality.join(", ") : pet.personality,
      status: pet.status,
      imageUrl: pet.image_url || pet.imageUrl,
      kennelId: pet.kennel_id || pet.kennelId,
      fromReportId: pet.from_report_id || pet.fromReportId,
      intakeDate: pet.intake_date || pet.intakeDate,
      description: pet.description,
    };

    try {
      await apiFetch(`/pets/${petId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Save successful!");
      setIsEditMode(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update pet profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMedical = async () => {
    if (!newMedical.recordType || !newMedical.recordDate) {
      alert("Please select a Type and Record Date.");
      return;
    }
    setIsAddingMedical(true);
    try {
      const payload = {
        petId: petId,
        recordType: newMedical.recordType,
        recordDate: newMedical.recordDate,
        nextDueDate: newMedical.nextDueDate || null,
        description: newMedical.description,
        createdBy: staff?.userId 
      };
      await apiFetch("/pet_medical_records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Medical record added successfully!");
      setNewMedical({
        recordType: "VACCINATION",
        recordDate: new Date().toISOString().split("T")[0],
        nextDueDate: "",
        description: "",
      });
      const updatedMedical = await loadPetMedicalRecords(petId);
      setMedical(updatedMedical);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add medical record.");
    } finally {
      setIsAddingMedical(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.note.trim()) {
      alert("Please enter a note / reason for the status change.");
      return;
    }
    setIsAddingLog(true);
    try {
      const payload = {
        petId: petId,
        oldStatus: pet.status, 
        newStatus: newLog.newStatus, 
        note: newLog.note,
        updatedBy: staff?.userId
      };

      await apiFetch("/pet_status_logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Status updated and logged successfully!");
      setPet({ ...pet, status: newLog.newStatus });
      setNewLog({ newStatus: newLog.newStatus, note: "" });

      const updatedLogs = await loadPetStatusLogs(petId);
      setLogs(updatedLogs);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add status log.");
    } finally {
      setIsAddingLog(false);
    }
  };

  if (loading) return <p className="text-center py-16 text-slate-400">Loading pet…</p>;

  if (!pet) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Pet not found.</p>
        <Link to="/admin/pets" className="text-[#f6931d] text-sm mt-4 inline-block">← Back to pets</Link>
      </div>
    );
  }

  const rescue = (pet.from_report_id || pet.fromReportId)
    ? rescues.find((r) => r.report_id === (pet.from_report_id || pet.fromReportId))
    : null;

  return (
    <div>
      <Link to="/admin/pets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to pets
      </Link>

      <AdminPageHeader
        title={`${pet.name} (${pet.pet_code || pet.petCode})`}
        description={pet.description}
      />

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <img
          src={pet.image_url || pet.imageUrl}
          alt={pet.name}
          className="w-full lg:w-72 h-56 object-cover rounded-xl border border-slate-800 shrink-0"
        />
        <div className="flex flex-wrap gap-2 items-start">
          <StatusBadge value={pet.status} />
          <StatusBadge value={pet.health_status || pet.healthStatus} />
          {Array.isArray(pet.personality) ? pet.personality.map((p: string) => (
            <span key={p} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300 ring-1 ring-white/[0.06]">
              {formatEnum(p)}
            </span>
          )) : (
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300 ring-1 ring-white/[0.06]">
              {pet.personality}
            </span>
          )}
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
        <AdminPanel 
          title="Pet profile"
          action={
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isEditMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-[#f6931d]/10 text-[#f6931d] hover:bg-[#f6931d]/20 border border-[#f6931d]/20"
              }`}
            >
              {isEditMode ? <><X size={14} /> Cancel Edit</> : <><Edit2 size={14} /> Edit Profile</>}
            </button>
          }
        >
          <AdminFieldGrid cols={3}>
            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                <input type="text" value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} className={adminInputClass()} />
              </div>
            ) : <AdminField label="Name" value={pet.name} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Species</p>
                <select value={pet.species} onChange={(e) => setPet({ ...pet, species: e.target.value })} className={adminInputClass()}>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            ) : <AdminField label="Species" value={formatEnum(pet.species)} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Breed</p>
                <input type="text" value={pet.breed || ""} onChange={(e) => setPet({ ...pet, breed: e.target.value })} className={adminInputClass()} />
              </div>
            ) : <AdminField label="Breed" value={pet.breed || "—"} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Gender</p>
                <select value={pet.gender} onChange={(e) => setPet({ ...pet, gender: e.target.value })} className={adminInputClass()}>
                  <option value="UNKNOWN">Unknown</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            ) : <AdminField label="Gender" value={formatEnum(pet.gender)} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Age (months)</p>
                <input type="number" value={pet.age_months || pet.ageMonths || ""} onChange={(e) => setPet({ ...pet, age_months: e.target.value, ageMonths: e.target.value })} className={adminInputClass()} />
              </div>
            ) : <AdminField label="Age" value={`${pet.age_months || pet.ageMonths || 0} months`} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Weight (kg)</p>
                <input type="number" step="0.1" value={pet.weight_kg || pet.weightKg || ""} onChange={(e) => setPet({ ...pet, weight_kg: e.target.value, weightKg: e.target.value })} className={adminInputClass()} />
              </div>
            ) : <AdminField label="Weight" value={`${pet.weight_kg || pet.weightKg || 0} kg`} />}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Intake date</p>
                <input type="date" value={pet.intake_date || pet.intakeDate || ""} onChange={(e) => setPet({ ...pet, intake_date: e.target.value, intakeDate: e.target.value })} className={adminInputClass()} />
              </div>
            ) : <AdminField label="Intake date" value={pet.intake_date || pet.intakeDate} />}

            {isEditMode && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Image URL</p>
                <input type="text" value={pet.image_url || pet.imageUrl || ""} onChange={(e) => setPet({ ...pet, image_url: e.target.value, imageUrl: e.target.value })} className={adminInputClass()} />
              </div>
            )}

            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Kennel</p>
                <select value={pet.kennel_id || pet.kennelId || ""} onChange={(e) => setPet({ ...pet, kennel_id: Number(e.target.value), kennelId: Number(e.target.value) })} className={adminInputClass()}>
                  <option value="">-- No Kennel --</option>
                  {kennels.map((k) => <option key={k.kennel_id} value={k.kennel_id}>{k.name}</option>)}
                </select>
              </div>
            ) : <AdminField label="Kennel" value={kennels.find(k => k.kennel_id === (pet.kennel_id || pet.kennelId))?.name || "—"} />}
            
            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Adoption status</p>
                <select value={pet.status} onChange={(e) => setPet({ ...pet, status: e.target.value })} className={adminInputClass()}>
                  {["NOT_READY_FOR_ADOPTION", "AVAILABLE_FOR_ADOPTION", "PENDING_ADOPTION", "ADOPTED", "DECEASED"].map((s) => (
                    <option key={s} value={s}>{formatEnum(s)}</option>
                  ))}
                </select>
              </div>
            ) : <AdminField label="Adoption status" value={formatEnum(pet.status)} />}
            
            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Health status</p>
                <select value={pet.health_status || pet.healthStatus} onChange={(e) => setPet({ ...pet, health_status: e.target.value, healthStatus: e.target.value })} className={adminInputClass()}>
                  {["HEALTHY", "VACCINATED", "STERILIZED", "UNDER_TREATMENT", "SPECIAL_NEEDS"].map((s) => (
                    <option key={s} value={s}>{formatEnum(s)}</option>
                  ))}
                </select>
              </div>
            ) : <AdminField label="Health status" value={formatEnum(pet.health_status || pet.healthStatus)} />}
            
            <AdminField label="From rescue" value={rescue ? <Link to="/admin/rescue" className="text-[#f6931d] hover:underline">{rescue.tracking_code}</Link> : "—"} />
          </AdminFieldGrid>
          
          <div className="mt-4 space-y-1">
            {isEditMode ? (
              <>
                <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                <textarea value={pet.description || ""} onChange={(e) => setPet({ ...pet, description: e.target.value })} className={adminInputClass()} rows={3} />
              </>
            ) : <AdminField label="Description" value={pet.description || "—"} />}
          </div>

          {isEditMode && (
            <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-end">
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
                <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </AdminPanel>
      ) : null}

      {tab === "medical" ? (
        <div className="space-y-4">
          <AdminPanel title="Add new medical record">
            <AdminFieldGrid cols={3}>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Type *</p>
                <select value={newMedical.recordType} onChange={(e) => setNewMedical({ ...newMedical, recordType: e.target.value })} className={adminInputClass()}>
                  <option value="VACCINATION">Vaccination</option>
                  <option value="DEWORMING">Deworming</option>
                  <option value="STERILIZATION">Sterilization</option>
                  <option value="CHECKUP">Checkup</option>
                  <option value="TREATMENT">Treatment</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Record Date *</p>
                <input type="date" required value={newMedical.recordDate} onChange={(e) => setNewMedical({ ...newMedical, recordDate: e.target.value })} className={adminInputClass()} />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Next Due Date</p>
                <input type="date" value={newMedical.nextDueDate} onChange={(e) => setNewMedical({ ...newMedical, nextDueDate: e.target.value })} className={adminInputClass()} />
              </div>
            </AdminFieldGrid>
            <div className="mt-4 space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Description / Notes</p>
              <textarea value={newMedical.description} onChange={(e) => setNewMedical({ ...newMedical, description: e.target.value })} className={adminInputClass()} rows={2} />
            </div>
            <div className="mt-4 flex justify-end border-t border-white/[0.04] pt-4">
              <button onClick={handleAddMedical} disabled={isAddingMedical} className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
                <Plus size={16} /> {isAddingMedical ? "Adding..." : "Add Record"}
              </button>
            </div>
          </AdminPanel>

          {medical.map((m: any) => (
            <AdminPanel key={m.medical_id || m.medicalId} title={formatEnum(m.record_type || m.recordType)}>
              <AdminFieldGrid cols={3}>
                <AdminField label="Date" value={m.record_date || m.recordDate} />
                <AdminField label="Next due" value={(m.next_due_date || m.nextDueDate) ?? "—"} />
                <AdminField label="Recorded by" value={m.created_by || m.createdBy || "Admin"} />
              </AdminFieldGrid>
              <AdminField label="Description" value={m.description} className="mt-3" />
            </AdminPanel>
          ))}
          {medical.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No medical records yet.</p> : null}
        </div>
      ) : null}

      {tab === "logs" ? (
        <div className="space-y-4">
          <AdminPanel title="Update Status & Add Log">
            <AdminFieldGrid cols={2}>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Current Status</p>
                <div className="h-10 flex items-center">
                   <StatusBadge value={pet.status} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">New Status *</p>
                <select
                  value={newLog.newStatus}
                  onChange={(e) => setNewLog({ ...newLog, newStatus: e.target.value })}
                  className={adminInputClass()}
                >
                  {[
                    "NOT_READY_FOR_ADOPTION",
                    "AVAILABLE_FOR_ADOPTION",
                    "PENDING_ADOPTION",
                    "ADOPTED",
                    "DECEASED",
                  ].map((s) => (
                    <option key={s} value={s}>{formatEnum(s)}</option>
                  ))}
                </select>
              </div>
            </AdminFieldGrid>

            <div className="mt-4 space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Note / Reason *</p>
              <textarea
                value={newLog.note}
                onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                className={adminInputClass()}
                rows={2}
                placeholder="Ex: Completed treatment, ready for adoption..."
              />
            </div>

            <div className="mt-4 flex justify-end border-t border-white/[0.04] pt-4">
              <button
                onClick={handleAddLog}
                disabled={isAddingLog}
                className="flex items-center gap-2 px-5 py-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                {isAddingLog ? "Saving..." : "Update Status"}
              </button>
            </div>
          </AdminPanel>

          <div className="space-y-3 mt-6">
            {logs.map((log: any) => (
              <div key={log.log_id || log.logId} className="admin-card p-4">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <StatusBadge value={(log.old_status || log.oldStatus) ?? "NOT_READY_FOR_ADOPTION"} />
                  <span className="text-slate-500">→</span>
                  <StatusBadge value={log.new_status || log.newStatus} />
                </div>
                <p className="text-sm text-slate-300">{log.note}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {log.updated_by || log.updatedBy || "System"} · {log.updated_at || log.updatedAt}
                </p>
              </div>
            ))}
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No status changes logged.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}