import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockEmailLogs } from "@/data/admin-mock";
import { getStaffName, loadEmailLogs } from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type EmailLogRow = Awaited<ReturnType<typeof loadEmailLogs>>[number];

export function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLogRow[]>(mockEmailLogs as EmailLogRow[]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    void loadEmailLogs().then((data) => {
      const sortedLogs = [...data].sort((a, b) => b.email_id - a.email_id);
      setLogs(sortedLogs);
      setCurrentPage(1); 
    });
  }, []);

  const pending = logs.filter((e) => e.status === "PENDING").length;
  const failed = logs.filter((e) => e.status === "FAILED").length;
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = logs.slice(startIndex, endIndex);

  return (
    <div>
      <AdminPageHeader
        title="Email logs"
        description="Outbound system emails for adoptions, volunteers, orders, and donations."
        badge="Admin"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Total logged</p>
          <p className="mt-1 text-2xl font-semibold text-white">{logs.length}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Pending send</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">{pending}</p>
        </div>
        <div className="admin-stat-card p-5">
          <p className="text-sm text-slate-400">Failed</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{failed}</p>
        </div>
      </div>

      <AdminDataTable
        rows={currentLogs.map((e) => ({
          id: e.email_id,
          recipient: e.recipient_email,
          subject: e.subject,
          type: formatEnum(e.email_type),
          status: <StatusBadge value={e.status} />,
          related: e.related_table ? `${e.related_table} #${e.related_id}` : "—",
          sentBy: getStaffName(e.sent_by),
          sentAt: e.sent_at ?? "—",
        }))}
        columns={[
          { key: "id", label: "ID" },
          { key: "recipient", label: "Recipient" },
          { key: "subject", label: "Subject" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "related", label: "Related" },
          { key: "sentBy", label: "Sent by" },
          { key: "sentAt", label: "Sent at" },
        ]}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-4 text-sm text-slate-400">
          <div>
            Showing <span className="font-medium text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-white">
              {Math.min(endIndex, logs.length)}
            </span>{" "}
            of <span className="font-medium text-white">{logs.length}</span> entries
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1 px-2 text-white font-medium">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}