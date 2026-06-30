import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { loadContactMessages, markContactMessageRead, } from "@/lib/admin/admin-data";
import { Button } from "@/components/ui/button";

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const paginatedMessages = messages.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const refresh = () => {
    loadContactMessages().then((data) => {
      setMessages(
        [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      );
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Messages sent by users." badge="Admin"/>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white"> Contact Message Detail</h2>
              <div className="space-y-4 text-slate-200">
                <div>
                  <span className="font-semibold text-slate-400">Name: {selectedMessage.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Email: {selectedMessage.email}</span>

                </div>
                <div>
                  <span className="font-semibold text-slate-400">Subject: {selectedMessage.subject}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Status: {selectedMessage.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Message: {selectedMessage.message}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  className="rounded-md border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      <AdminDataTable
        rows={paginatedMessages.map((m) => ({
          id: m.messageId,
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          status: m.status,
          created: m.createdAt,
          view: (
            <Button size="sm" className="rounded-md border border-sky-500/30 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
              onClick={(e) => { e.stopPropagation(); setSelectedMessage(m);}}
            >
              View
            </Button>
          ),

          action:
            m.status === "UNREAD" ? (
              <Button size="sm" className="rounded-md bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                onClick={async (e) => { e.stopPropagation(); await markContactMessageRead(m.messageId); refresh();}}
              >
                Unread
              </Button>
            ) : (
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  m.status === "READ"
                    ? "bg-sky-500/20 text-sky-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {m.status}
              </span>
            ),
        }))}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject" },
          { key: "message", label: "Message" },
          { key: "status", label: "Status" },
          { key: "created", label: "Created" },
          { key: "view", label: "View" },
          { key: "action", label: "Action"},
        ]}
      />
      <div className="mt-4 flex items-center justify-between">
        <Button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <span className="text-slate-400">
          Page {page} / {Math.ceil(messages.length / PAGE_SIZE)}
        </span>

        <Button
          disabled={page >= Math.ceil(messages.length / PAGE_SIZE)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}