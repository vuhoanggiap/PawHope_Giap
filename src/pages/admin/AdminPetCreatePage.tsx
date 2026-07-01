import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { ArrowLeft } from "lucide-react";
import { AdminPanel, AdminFieldGrid } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { apiFetch } from "@/lib/api-client";
import { loadKennels, loadRescueReports, loadAdminPets, invalidateAdminPetsCache } from "@/lib/admin/admin-data";
import type { PetResDto } from "@/lib/api/mappers";

export function AdminPetCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {}; 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kennels, setKennels] = useState<any[]>([]);
  const [rescues, setRescues] = useState<any[]>([]);

  useEffect(() => {
    void Promise.all([loadKennels(), loadRescueReports(), loadAdminPets()])
      .then(([kennelList, rescueList, petList]) => {
        setKennels(kennelList);
        setRescues(rescueList);

        const reportId = prefill.fromReportId != null ? Number(prefill.fromReportId) : null;
        if (reportId) {
          const existing = petList.find((p) => p.from_report_id === reportId);
          if (existing) {
            navigate(`/admin/pets/${existing.pet_id}`, { replace: true });
          }
        }
      })
      .catch((err) => console.error("Error loading auxiliary data:", err));
  }, [navigate, prefill.fromReportId]);

  const [formData, setFormData] = useState({
    name: "",
    species: "DOG",
    gender: "UNKNOWN",
    breed: "",
    ageMonths: "",
    weightKg: "",
    healthStatus: "HEALTHY",
    personality: "",
    status: "NOT_READY_FOR_ADOPTION", 
    intakeDate: new Date().toISOString().split("T")[0], 
    kennelId: "",
    imageUrl: prefill.imageUrl || "",
    description: prefill.description || "",
    fromReportId: prefill.fromReportId != null ? String(prefill.fromReportId) : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      ageMonths: formData.ageMonths ? parseInt(formData.ageMonths) : null,
      weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
      kennelId: formData.kennelId ? parseInt(formData.kennelId) : null,
      fromReportId: formData.fromReportId ? parseInt(formData.fromReportId) : null,
    };

    try {
      const created = await apiFetch<PetResDto>("/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      invalidateAdminPetsCache();
      navigate(`/admin/pets/${created.petId}`);

    } catch (err: any) {
      console.error("Caught error:", err);
      setError(err.message || "An error occurred while creating the pet profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/admin/pets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to pets
      </Link>

      <AdminPageHeader 
        title="Add New Pet" 
        description="Enter information to create a new pet profile in the system." 
      />

      {error && (
        <div className="mb-6 p-4 rounded border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminPanel title="Pet Information">
          <AdminFieldGrid cols={3}>
            
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pet Name *</p>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={adminInputClass()} placeholder="e.g., Lu, Misa..." />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Species *</p>
              <select name="species" value={formData.species} onChange={handleChange} className={adminInputClass()}>
                <option value="DOG">Dog</option>
                <option value="CAT">Cat</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Gender</p>
              <select name="gender" value={formData.gender} onChange={handleChange} className={adminInputClass()}>
                <option value="UNKNOWN">Unknown</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Breed</p>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className={adminInputClass()} placeholder="e.g., Corgi, Mixed..." />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Age (Months)</p>
              <input type="number" min="0" name="ageMonths" value={formData.ageMonths} onChange={handleChange} className={adminInputClass()} placeholder="e.g., 12" />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Weight (kg)</p>
              <input type="number" step="0.1" min="0" name="weightKg" value={formData.weightKg} onChange={handleChange} className={adminInputClass()} placeholder="e.g., 4.5" />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Health Status</p>
              <select name="healthStatus" value={formData.healthStatus} onChange={handleChange} className={adminInputClass()}>
                <option value="HEALTHY">Healthy</option>
                <option value="VACCINATED">Vaccinated</option>
                <option value="STERILIZED">Sterilized</option>
                <option value="UNDER_TREATMENT">Under Treatment</option>
                <option value="SPECIAL_NEEDS">Special Needs</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Adoption Status</p>
              <select name="status" value={formData.status} onChange={handleChange} className={adminInputClass()}>
                <option value="NOT_READY_FOR_ADOPTION">Not Ready for Adoption</option>
                <option value="AVAILABLE_FOR_ADOPTION">Available for Adoption</option>
              </select>
            </div>

             <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Intake Date *</p>
              <input required type="date" name="intakeDate" value={formData.intakeDate} onChange={handleChange} className={adminInputClass()} />
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Assign to Kennel</p>
              <select name="kennelId" value={formData.kennelId} onChange={handleChange} className={adminInputClass()}>
                <option value="">-- Select Kennel --</option>
                {kennels.map((k) => (
                  <option key={k.kennel_id} value={k.kennel_id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">From Rescue Report</p>
              <select name="fromReportId" value={formData.fromReportId} onChange={handleChange} className={adminInputClass()}>
                <option value="">-- None (Manual Entry) --</option>
                {rescues.map((r) => (
                  <option key={r.report_id} value={r.report_id}>{r.tracking_code} - {r.reporter_name}</option>
                ))}
              </select>
            </div>

             <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Image URL</p>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={adminInputClass()} placeholder="https://..." />
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Pet preview"
                  className="mt-2 max-h-40 rounded-xl border border-white/10 object-cover"
                />
              ) : null}
            </div>

          </AdminFieldGrid>

          <div className="mt-4 space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Description / Personality / Background</p>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={adminInputClass()} placeholder="Additional notes about rescue background, behavior..."></textarea>
          </div>

        </AdminPanel>

        <div className="flex justify-end border-t border-slate-700/50 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#f6931d] hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Pet Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}