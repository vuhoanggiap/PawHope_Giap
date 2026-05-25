import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdoptions } from "@/data/admin-mock";
import { ChevronRight } from "lucide-react";

export function AdminAdoptionsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Adoptions"
        description="Open an application to review full details, meetings, handover, and follow-ups."
      />

      <div className="space-y-3">
        {mockAdoptions.map((a) => (
          <Link
            key={a.adoption_id}
            to={`/admin/adoptions/${a.adoption_id}`}
            className="admin-card-hover block p-4 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="font-medium text-white group-hover:text-[#f6931d]">
                  {a.application_code} — {a.pet_name}
                </p>
                <p className="text-sm text-slate-400">
                  {a.applicant_name} · {a.applicant_email} · {a.applicant_phone}
                </p>
                <p className="text-xs text-slate-500">Applied {a.apply_date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={a.status} />
                <StatusBadge value={a.priority_level} />
                <StatusBadge value={a.payment_status} />
                <ChevronRight size={18} className="text-slate-600 group-hover:text-[#f6931d]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
