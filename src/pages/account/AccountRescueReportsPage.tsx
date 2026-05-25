import { Link } from "react-router-dom";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { formatPublicEnum } from "@/data/public-mock";
import { getUserRescueReports } from "@/lib/public-store";

export function AccountRescueReportsPage() {
  const { user } = usePublicAuth();
  if (!user) return null;

  const reports = getUserRescueReports(user.userId);

  return (
    <div className="soft-card p-6 md:p-8">
      <h2 className="soft-heading text-lg mb-1">My rescue reports</h2>
      <p className="soft-subtext text-sm mb-6">
        Reports linked to your account while signed in. Guest reports can still be tracked by code.
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-12 soft-subtext">
          <p>No reports linked to this account yet.</p>
          <Link to="/rescue" className="inline-block mt-4 text-[#f6931d] font-medium hover:underline">
            Submit a rescue report →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              key={r.tracking_code}
              to={`/rescue/track/${r.tracking_code}`}
              className="block p-4 rounded-2xl border border-[#2c5f51]/[0.06] hover:border-[#f6931d]/25 transition-colors"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-[#2c5f51]">{r.tracking_code}</p>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#e6f2ec] text-[#3d6b5c]">
                  {formatPublicEnum(r.status)}
                </span>
              </div>
              <p className="text-sm soft-subtext mt-1 truncate">{r.location_text}</p>
              <p className="text-xs text-[#a8b8ae] mt-1">{r.created_at}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
