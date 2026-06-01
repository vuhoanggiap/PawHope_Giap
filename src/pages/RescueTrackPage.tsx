import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { StatusTimeline } from "@/components/public/StatusTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPublicEnum, rescueStatusIndex } from "@/data/public-mock";
import { loadRescueByCode } from "@/lib/public-store";
import type { PublicRescueReport } from "@/data/public-mock";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";

const rescueSteps = [
  { id: "pending", label: "Report received", description: "Your case is logged and prioritized." },
  { id: "progress", label: "Volunteer dispatched", description: "A coordinator or volunteer is on the way." },
  { id: "rescued", label: "Animal safe", description: "The animal reached care or the case is resolved." },
];

const urgencyTone: Record<string, string> = {
  CRITICAL: "text-red-700 bg-red-50 border-red-200",
  HIGH: "text-orange-700 bg-orange-50 border-orange-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  LOW: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

export function RescueTrackPage() {
  const { code: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = paramCode ?? searchParams.get("code") ?? "";
  const [query, setQuery] = useState(initial);
  const [searched, setSearched] = useState(initial.trim());
  const [report, setReport] = useState<PublicRescueReport | undefined>();
  const [loading, setLoading] = useState(Boolean(initial.trim()));

  const fetchReport = useCallback((code: string, showSpinner = true) => {
    if (!code.trim()) {
      setReport(undefined);
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    void loadRescueByCode(code).then((r) => {
      setReport(r);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!searched.trim()) {
      setReport(undefined);
      setLoading(false);
      return;
    }
    fetchReport(searched);
  }, [searched, fetchReport]);

  useEffect(() => {
    if (!searched.trim()) return;
    const id = window.setInterval(() => fetchReport(searched, false), 60_000);
    return () => window.clearInterval(id);
  }, [searched, fetchReport]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearched(q);
    if (q) navigate(`/rescue/track/${encodeURIComponent(q)}`, { replace: true });
  };

  // --- SỬA LỖI TIMELINE Ở ĐÂY ---
  const baseIndex = report ? rescueStatusIndex(report.status) : 0;
  // Nếu status là RESCUED, ép index vượt quá mảng để đánh dấu tích xanh toàn bộ
  const activeIndex = report?.status === "RESCUED" ? rescueSteps.length : baseIndex;
  const failed = report?.status === "FAILED";

  return (
    <>
      <PageHero
        title="Track a rescue report"
        subtitle="Enter your tracking code to see the latest status."
        imageUrl="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1600"
      />

      <section className="public-section soft-section-warm">
        <div className="public-container-narrow space-y-6 sm:space-y-8">
          <form onSubmit={handleSearch} className="soft-card p-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-[#5a6b60]">Tracking code</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. RSC-2026-DEMO1"
                className="mt-1.5 rounded-2xl border-[#2c5f51]/10"
              />
            </div>
            <Button
              type="submit"
              className="sm:self-end rounded-full bg-[#2c5f51] hover:bg-[#3d6b5c] h-11 px-8 font-medium"
            >
              <Search size={18} className="mr-2" /> Track
            </Button>
          </form>

          <p className="text-sm soft-subtext text-center">
            Try demo codes:{" "}
            <button
              type="button"
              className="text-[#f6931d] font-medium hover:underline"
              onClick={() => {
                setQuery("RSC-2026-DEMO1");
                setSearched("RSC-2026-DEMO1");
                navigate("/rescue/track/RSC-2026-DEMO1", { replace: true });
              }}
            >
              RSC-2026-DEMO1
            </button>
            {" · "}
            <button
              type="button"
              className="text-[#f6931d] font-medium hover:underline"
              onClick={() => {
                setQuery("RSC-2026-DEMO2");
                setSearched("RSC-2026-DEMO2");
                navigate("/rescue/track/RSC-2026-DEMO2", { replace: true });
              }}
            >
              RSC-2026-DEMO2
            </button>
          </p>

          {!searched ? (
            <div className="soft-card p-10 text-center soft-subtext text-sm">
              Enter a code above to view your rescue timeline.
            </div>
          ) : loading ? (
            <div className="soft-card p-10 text-center soft-subtext text-sm">Loading report…</div>
          ) : !report ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Code not found</p>
                <p className="text-sm text-amber-800 mt-1">
                  Double-check the code from your confirmation email or{" "}
                  <Link to="/rescue" className="underline font-medium">
                    submit a new report
                  </Link>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="soft-card p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="soft-label">Tracking code</p>
                  <p className="text-xl font-bold text-[#2c5f51]">{report.tracking_code}</p>
                  <p className="text-sm soft-subtext mt-1">
                    Submitted {report.created_at} · Updated {report.updated_at}
                  </p>
                  <p className="text-xs soft-subtext mt-2">Status refreshes every minute.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#2c5f51]/15"
                    onClick={() => fetchReport(searched)}
                  >
                    <RefreshCw size={16} className="mr-2" /> Refresh
                  </Button>
                  <span
                    className={cn(
                      "text-xs font-semibold px-3 py-1 rounded-full border",
                      urgencyTone[report.urgency_level] ?? urgencyTone.MEDIUM
                    )}
                  >
                    {formatPublicEnum(report.urgency_level)} urgency
                  </span>
                </div>
              </div>

              {report.image_url ? (
                <img
                  src={report.image_url}
                  alt="Rescue scene"
                  className="w-full max-h-64 rounded-2xl object-cover border border-[#2c5f51]/10"
                />
              ) : null}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#a8b8ae]">Location</p>
                  <p className="text-[#3d6b5c] mt-1">{report.location_text}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#a8b8ae]">Current status</p>
                  <p className="text-[#3d6b5c] mt-1 font-semibold">{formatPublicEnum(report.status)}</p>
                </div>
              </div>

              <StatusTimeline
                steps={rescueSteps}
                activeIndex={failed ? 0 : Math.max(activeIndex, 0)}
                failed={failed}
                failedLabel="This rescue case could not be completed. Our team may follow up by phone."
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}