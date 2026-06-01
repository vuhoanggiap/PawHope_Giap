import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import { ArrowLeft } from "lucide-react";
import { AdminPanel, AdminFieldGrid } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { apiFetch } from "@/lib/api-client";
import { loadKennels, loadRescueReports } from "@/lib/admin/admin-data";

export function AdminPetCreatePage() {
  const navigate = useNavigate();
  const location = useLocation(); // Nhận dữ liệu truyền từ trang khác sang (nếu có)
  const prefill = location.state || {}; // Nếu không có data thì dùng object rỗng để form trống

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load danh sách chuồng và đơn cứu hộ để hiển thị trong dropdown
  const [kennels, setKennels] = useState<any[]>([]);
  const [rescues, setRescues] = useState<any[]>([]);

  useEffect(() => {
    void Promise.all([loadKennels(), loadRescueReports()])
      .then(([kennelList, rescueList]) => {
        setKennels(kennelList);
        setRescues(rescueList);
      })
      .catch((err) => console.error("Error loading auxiliary data:", err));
  }, []);

  // State khởi tạo form, ưu tiên lấy dữ liệu từ prefill nếu có
  const [formData, setFormData] = useState({
    name: "",
    species: "DOG",
    gender: "UNKNOWN",
    breed: "",
    ageMonths: "",
    weightKg: "",
    healthStatus: "HEALTHY",
    personality: "",
    status: "NOT_READY_FOR_ADOPTION", // Mặc định chưa sẵn sàng nhận nuôi
    intakeDate: new Date().toISOString().split("T")[0], // Mặc định hôm nay
    kennelId: "",
    // Các trường dưới đây sẽ tự điền nếu đi từ trang Cứu hộ sang
    imageUrl: prefill.imageUrl || "",
    description: prefill.description || "",
    fromReportId: prefill.fromReportId || "",
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

    // Ép kiểu dữ liệu trước khi gửi xuống Spring Boot
    const payload = {
      ...formData,
      ageMonths: formData.ageMonths ? parseInt(formData.ageMonths) : null,
      weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
      kennelId: formData.kennelId ? parseInt(formData.kennelId) : null,
      fromReportId: formData.fromReportId ? parseInt(formData.fromReportId) : null,
    };

    try {
      await apiFetch("/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Bỏ qua việc tìm ID rườm rà, API không văng lỗi là lưu thành công!
      alert("Pet profile created successfully!");
      
      // Chuyển thẳng ra trang danh sách thú cưng
      navigate("/admin/pets"); 

    } catch (err: any) {
      console.error("❌ Caught error:", err);
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