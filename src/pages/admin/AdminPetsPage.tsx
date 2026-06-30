import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockKennels } from "@/data/admin-mock";
import { loadKennels } from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { ChevronRight, Trash2 } from "lucide-react"; 
import { useEffect, useState } from "react";
import { useAllPets } from "@/hooks/usePets";
import { apiFetch } from "@/lib/api-client"; 

export function AdminPetsPage() {
  const { pets, loading, error } = useAllPets();
  const [kennels, setKennels] = useState(mockKennels);

  useEffect(() => {
    void loadKennels().then(setKennels);
  }, []);

  const handleDelete = async (e: React.MouseEvent, petId: number) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    const confirmDelete = window.confirm("Are you sure you want to delete this pet profile? This action cannot be undone..");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/pets/${petId}`, { method: "DELETE" });
      alert("Pet deleted successfully!");
      window.location.reload(); 
    } catch (err: any) {
      alert(err.message || "Error occurred while deleting the pet.");
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading pet data from the system...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 bg-red-500/10 rounded-lg">Error loading data: {error}</div>;
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

                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button
                        onClick={(e) => handleDelete(e, pet.id || pet.petId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete manually created profile"
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