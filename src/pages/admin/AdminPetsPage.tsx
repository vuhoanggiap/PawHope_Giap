import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockKennels } from "@/data/admin-mock";
import { loadKennels } from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { ChevronRight, Trash2 } from "lucide-react"; // Bổ sung icon Trash2
import { useEffect, useState } from "react";
import { useAllPets } from "@/hooks/usePets";
import { apiFetch } from "@/lib/api-client"; // Bổ sung apiFetch để gọi lệnh Xóa

export function AdminPetsPage() {
  const { pets, loading, error } = useAllPets();
  const [kennels, setKennels] = useState(mockKennels);

  useEffect(() => {
    void loadKennels().then(setKennels);
  }, []);

  // --- HÀM XỬ LÝ XÓA THÚ CƯNG ---
  const handleDelete = async (e: React.MouseEvent, petId: number) => {
    e.preventDefault(); // Ngăn không cho thẻ Link chuyển trang
    e.stopPropagation(); // Ngăn chặn nổi bọt sự kiện

    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa hồ sơ thú cưng này không? Hành động này không thể hoàn tác.");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/pets/${petId}`, { method: "DELETE" });
      alert("Đã xóa thú cưng thành công!");
      window.location.reload(); // Tải lại trang để cập nhật danh sách
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa thú cưng.");
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải dữ liệu thú cưng từ hệ thống...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 bg-red-500/10 rounded-lg">Lỗi tải dữ liệu: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <AdminPageHeader
          title="Pets"
          description="Select a pet to view full profile, medical records, and status history."
        />
        
        <Link
          to="/admin/pets/create"
          className="px-4 py-2 mt-2 bg-[#f6931d] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Add New Pet
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {pets.map((pet: any) => {
          const kennel = kennels.find((k) => k.kennel_id === pet.kennelId);
          
          // ĐIỀU KIỆN ĐƯỢC PHÉP XÓA: Không có fromReportId VÀ trạng thái là NOT_READY_FOR_ADOPTION
          const canDelete = !pet.fromReportId && pet.status === "NOT_READY_FOR_ADOPTION";
          
          return (
            <Link
              key={pet.id || pet.petId}
              to={`/admin/pets/${pet.id || pet.petId}`}
              className="group admin-card-hover overflow-hidden relative"
            >
              <img src={pet.imageUrl} alt={pet.name} className="h-40 w-full object-cover" />
              
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-white group-hover:text-[#f6931d] transition-colors">
                      {pet.name}
                    </p>
                    <p className="text-xs text-slate-500">{pet.petCode}</p>
                  </div>
                  
                  {/* Khu vực chứa nút Xóa và Badge Trạng thái */}
                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button
                        onClick={(e) => handleDelete(e, pet.id || pet.petId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        title="Xóa hồ sơ tạo thủ công"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <StatusBadge value={pet.status} />
                  </div>
                </div>
                
                <p className="text-sm text-slate-400">
                  {formatEnum(pet.species)} · {pet.breed} · {pet.ageMonths} mo · {formatEnum(pet.gender)}
                </p>
                
                <p className="text-xs text-slate-500">
                  {kennel?.name || "Chưa xếp chuồng"} · {formatEnum(pet.healthStatus)}
                </p>
                
                <span className="inline-flex items-center gap-1 text-xs text-[#f6931d] font-medium pt-1">
                  Edit / View full profile <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}