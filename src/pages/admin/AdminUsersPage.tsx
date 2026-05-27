import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminField, AdminFieldGrid, AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockUsers } from "@/data/admin-mock";
import { loadUsers, updateUserActive, updateUserRole } from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";

export function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedId, setSelectedId] = useState<number | null>(mockUsers[0]?.user_id ?? null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => void loadUsers().then(setUsers);

  useEffect(() => {
    refresh();
  }, []);

  const selected = users.find((u) => u.user_id === selectedId);

  const handleRole = (role: string) => {
    if (!selected) return;
    setUsers((prev) =>
      prev.map((u) => (u.user_id === selected.user_id ? { ...u, role } : u))
    );
    if (USE_MOCK) return;
    void updateUserRole(selected.user_id, role)
      .then(() => {
        setMessage("Role updated.");
        refresh();
      })
      .catch((e) => setMessage(e instanceof ApiError ? e.message : "Update failed"));
  };

  const handleStatus = (status: number) => {
    if (!selected) return;
    setUsers((prev) =>
      prev.map((u) => (u.user_id === selected.user_id ? { ...u, status } : u))
    );
    if (USE_MOCK) return;
    void updateUserActive(selected.user_id, status === 1)
      .then(() => {
        setMessage("Status updated.");
        refresh();
      })
      .catch((e) => setMessage(e instanceof ApiError ? e.message : "Update failed"));
  };

  return (
    <div>
      <AdminPageHeader title="Users" description="Manage accounts, roles, and active status." badge="Admin" />

      {message ? (
        <p className="mb-4 text-sm text-slate-400">{message}</p>
      ) : null}

      <div className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <AdminDataTable
            rows={users.map((u) => ({
              id: u.user_id,
              username: u.username,
              name: u.full_name,
              role: u.role,
              __id: u.user_id,
            }))}
            columns={[
              { key: "id", label: "ID" },
              { key: "username", label: "Username" },
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
            ]}
            onRowClick={(row) => setSelectedId(row.__id as number)}
          />
        </div>

        <div className="xl:col-span-3">
          {!selected ? (
            <AdminPanel title="User detail">
              <p className="text-sm text-slate-500">Select a user.</p>
            </AdminPanel>
          ) : (
            <AdminPanel title={selected.full_name}>
              <AdminFieldGrid cols={3}>
                <AdminField label="User ID" value={selected.user_id} />
                <AdminField label="Username" value={selected.username} />
                <AdminField label="Email" value={selected.email} />
                <AdminField label="Phone" value={selected.phone} />
                <AdminField label="Created" value={selected.created_at || "—"} />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                  <select
                    value={selected.role}
                    onChange={(e) => handleRole(e.target.value)}
                    className={adminInputClass()}
                  >
                    {["ADMIN", "VOLUNTEER", "USER"].map((r) => (
                      <option key={r} value={r}>
                        {formatEnum(r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatus(Number(e.target.value))}
                    className={adminInputClass()}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </AdminFieldGrid>
              <p className="text-xs text-slate-500 mt-4">
                Role/status changes call the API when mock mode is off. Password reset is not available on the backend yet.
              </p>
            </AdminPanel>
          )}
        </div>
      </div>
    </div>
  );
}
