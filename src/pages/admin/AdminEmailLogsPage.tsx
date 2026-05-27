import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockEmailLogs } from "@/data/admin-mock";
import { getStaffName, loadEmailLogs } from "@/lib/admin/admin-data";
import { formatEnum } from "@/lib/adminFormat";
import { useEffect, useState } from "react";

type EmailLogRow = Awaited<ReturnType<typeof loadEmailLogs>>[number];

export function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLogRow[]>(mockEmailLogs as EmailLogRow[]);

  useEffect(() => {
    void loadEmailLogs().then(setLogs);
  }, []);

  const pending = logs.filter((e) => e.status === "PENDING").length;
  const failed = logs.filter((e) => e.status === "FAILED").length;

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
        rows={logs.map((e) => ({
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
    </div>
  );
}
