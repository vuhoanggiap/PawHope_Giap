import { Link, useParams } from "react-router-dom";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { adoptionProgressSteps, formatPublicEnum, adoptionStatusIndex } from "@/data/public-mock";
import { getAdoptionById } from "@/lib/public-store";
import { ArrowLeft } from "lucide-react";

export function AccountAdoptionDetailPage() {
  const { id } = useParams();
  const { user } = usePublicAuth();
  if (!user) return null;

  const adoption = getAdoptionById(user.userId, Number(id));

  if (!adoption) {
    return (
      <div className="soft-card p-8 text-center soft-subtext">
        <p>Application not found.</p>
        <Link to="/account/adoptions" className="text-[#f6931d] font-medium mt-4 inline-block hover:underline">
          Back to adoptions
        </Link>
      </div>
    );
  }

  const failed = adoption.status === "REJECTED" || adoption.status === "CANCELLED";
  const activeIndex = adoptionStatusIndex(adoption.status);

  return (
    <div className="space-y-6">
      <Link
        to="/account/adoptions"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#f6931d] hover:underline"
      >
        <ArrowLeft size={16} /> All adoptions
      </Link>

      <div className="soft-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <img src={adoption.pet_image} alt="" className="w-full sm:w-40 h-40 rounded-2xl object-cover" />
          <div>
            <p className="soft-label">Application</p>
            <h2 className="text-2xl font-bold text-[#2c5f51]">{adoption.pet_name}</h2>
            <p className="soft-subtext text-sm mt-1">{adoption.application_code}</p>
            <p className="text-sm mt-3">
              Status:{" "}
              <span className="font-semibold text-[#3d6b5c]">{formatPublicEnum(adoption.status)}</span>
            </p>
            {adoption.housing_type ? (
              <p className="text-sm soft-subtext mt-1">
                Housing: {formatPublicEnum(adoption.housing_type)}
              </p>
            ) : null}
          </div>
        </div>

        <h3 className="font-semibold text-[#2c5f51] mb-4">Progress</h3>
        <StatusTimeline
          steps={adoptionProgressSteps.map((s) => ({
            id: s.status,
            label: s.label,
            description: s.description,
          }))}
          activeIndex={failed ? 0 : Math.max(activeIndex, 0)}
          failed={failed}
          failedLabel={
            adoption.status === "REJECTED"
              ? "This application was not approved. Contact us if you have questions."
              : "This application was cancelled."
          }
        />
      </div>
    </div>
  );
}
