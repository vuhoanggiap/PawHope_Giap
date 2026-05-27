import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum, type PublicAdoption } from "@/data/public-mock";
import { loadUserAdoptions } from "@/lib/public-store";
import { ChevronRight } from "lucide-react";

export function AccountAdoptionsPage() {
  const { user } = usePublicAuth();
  const [adoptions, setAdoptions] = useState<PublicAdoption[]>([]);

  useEffect(() => {
    if (!user) return;
    void loadUserAdoptions(user.userId).then(setAdoptions);
  }, [user]);

  if (!user) return null;

  return (
    <div className="soft-card p-6 md:p-8">
      <h2 className="soft-heading text-lg mb-1">My adoptions</h2>
      <p className="soft-subtext text-sm mb-6">Track each application from review to handover.</p>

      {adoptions.length === 0 ? (
        <div className="text-center py-12 soft-subtext">
          <p>No applications yet.</p>
          <Link to="/adopt" className="inline-block mt-4 text-[#f6931d] font-medium hover:underline">
            Find a pet to adopt →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {adoptions.map((a) => (
            <Link
              key={a.adoption_id}
              to={`/account/adoptions/${a.adoption_id}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#2c5f51]/[0.06] hover:border-[#f6931d]/25 hover:shadow-sm transition-all group"
            >
              <img src={a.pet_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2c5f51] group-hover:text-[#f6931d]">{a.pet_name}</p>
                <p className="text-sm soft-subtext truncate">
                  {a.application_code} · Applied {a.apply_date}
                </p>
                <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#e6f2ec] text-[#3d6b5c]">
                  {formatPublicEnum(a.status)}
                </span>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-[#f6931d]" size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
