import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdminPets, mockKennels } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";
import { ChevronRight } from "lucide-react";

export function AdminPetsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Pets"
        description="Select a pet to view full profile, medical records, and status history."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockAdminPets.map((pet) => {
          const kennel = mockKennels.find((k) => k.kennel_id === pet.kennel_id);
          return (
            <Link
              key={pet.pet_id}
              to={`/admin/pets/${pet.pet_id}`}
              className="group admin-card-hover overflow-hidden"
            >
              <img src={pet.image_url} alt={pet.name} className="h-40 w-full object-cover" />
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-white group-hover:text-[#f6931d] transition-colors">
                      {pet.name}
                    </p>
                    <p className="text-xs text-slate-500">{pet.pet_code}</p>
                  </div>
                  <StatusBadge value={pet.status} />
                </div>
                <p className="text-sm text-slate-400">
                  {formatEnum(pet.species)} · {pet.breed} · {pet.age_months} mo · {formatEnum(pet.gender)}
                </p>
                <p className="text-xs text-slate-500">
                  {kennel?.name} · {formatEnum(pet.health_status)}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-[#f6931d] font-medium pt-1">
                  View full profile <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
