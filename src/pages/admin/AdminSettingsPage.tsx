import { FormEvent, useEffect, useState } from "react";
import { AdminFieldGrid, AdminPanel, AdminTabs } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAdoptionGuidelines,
  getOrganization,
  loadAdoptionGuidelines,
  loadOrganization,
  saveGuideline,
  saveOrganization,
  type AdminGuideline,
  type AdminOrganization,
} from "@/lib/admin-store";
import { USE_MOCK } from "@/lib/api-client";
import { CheckCircle2, Plus } from "lucide-react";

export function AdminSettingsPage() {
  const [tab, setTab] = useState("organization");
  const [org, setOrg] = useState<AdminOrganization>(() => getOrganization());
  const [guidelines, setGuidelines] = useState<AdminGuideline[]>(() => getAdoptionGuidelines());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void loadOrganization().then(setOrg);
    void loadAdoptionGuidelines().then(setGuidelines);
  }, []);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveOrganization(org);
    flashSaved();
  };

  const handleGuidelineSave = (item: AdminGuideline) => {
    saveGuideline(item);
    setGuidelines(getAdoptionGuidelines());
    flashSaved();
  };

  const addGuideline = () => {
    const nextId = Math.max(0, ...guidelines.map((g) => g.guide_id)) + 1;
    const item: AdminGuideline = {
      guide_id: nextId,
      title: "New guideline",
      content: "Describe the requirement for adopters.",
      priority: guidelines.length + 1,
    };
    saveGuideline(item);
    setGuidelines(getAdoptionGuidelines());
  };

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="Organization profile and adoption guidelines shown on the public site."
        badge="Admin"
      />

      {saved ? (
        <div className="admin-panel mb-6 flex items-center gap-2 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} />{" "}
          {USE_MOCK
            ? "Settings saved locally (mock mode)."
            : "Saved locally — backend has no update API for organization/guidelines yet."}
        </div>
      ) : null}

      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "organization", label: "Organization" },
          { id: "guidelines", label: "Adoption guidelines" },
        ]}
        className="mb-6"
      />

      {tab === "organization" ? (
        <form onSubmit={handleOrgSubmit} className="admin-panel space-y-5 p-6">
          <AdminFieldGrid cols={2}>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">Organization name</label>
              <input
                required
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className={adminInputClass()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">Tagline</label>
              <input
                value={org.tagline}
                onChange={(e) => setOrg({ ...org, tagline: e.target.value })}
                className={adminInputClass()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">Hotline</label>
              <input
                required
                value={org.hotline}
                onChange={(e) => setOrg({ ...org, hotline: e.target.value })}
                className={adminInputClass()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
              <input
                required
                type="email"
                value={org.email}
                onChange={(e) => setOrg({ ...org, email: e.target.value })}
                className={adminInputClass()}
              />
            </div>
          </AdminFieldGrid>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Address</label>
            <textarea
              required
              value={org.address}
              onChange={(e) => setOrg({ ...org, address: e.target.value })}
              className={adminInputClass("min-h-[80px] py-3")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Mission statement</label>
            <textarea
              required
              value={org.mission}
              onChange={(e) => setOrg({ ...org, mission: e.target.value })}
              className={adminInputClass("min-h-[100px] py-3")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-slate-500">Facebook link</label>
            <input
              value={org.facebook}
              onChange={(e) => setOrg({ ...org, facebook: e.target.value })}
              className={adminInputClass()}
            />
          </div>
          <button type="submit" className="admin-btn-primary">
            Save organization
          </button>
        </form>
      ) : null}

      {tab === "guidelines" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={addGuideline} className="admin-btn-secondary gap-2">
              <Plus size={16} /> Add guideline
            </button>
          </div>
          {guidelines.map((g) => (
            <AdminPanel key={g.guide_id} title={`Priority ${g.priority} · ${g.title}`}>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wide text-slate-500">Title</label>
                    <input
                      value={g.title}
                      onChange={(e) =>
                        setGuidelines((prev) =>
                          prev.map((x) => (x.guide_id === g.guide_id ? { ...x, title: e.target.value } : x))
                        )
                      }
                      className={adminInputClass()}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wide text-slate-500">Priority</label>
                    <input
                      type="number"
                      min={1}
                      value={g.priority}
                      onChange={(e) =>
                        setGuidelines((prev) =>
                          prev.map((x) =>
                            x.guide_id === g.guide_id ? { ...x, priority: Number(e.target.value) } : x
                          )
                        )
                      }
                      className={adminInputClass()}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-500">Content</label>
                  <textarea
                    value={g.content}
                    onChange={(e) =>
                      setGuidelines((prev) =>
                        prev.map((x) => (x.guide_id === g.guide_id ? { ...x, content: e.target.value } : x))
                      )
                    }
                    className={adminInputClass("min-h-[90px] py-3")}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleGuidelineSave(guidelines.find((x) => x.guide_id === g.guide_id) ?? g)}
                >
                  Save guideline
                </button>
              </div>
            </AdminPanel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
