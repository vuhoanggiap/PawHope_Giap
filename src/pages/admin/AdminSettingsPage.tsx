import { FormEvent, useEffect, useState } from "react";
import {
  AdminFieldGrid,
  AdminPanel,
  AdminTabs,
} from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import {
  getOrganizationApi,
  saveOrganizationApi,
  getGuidelinesApi,
  createGuidelineApi,
  updateGuidelineApi, deleteGuidelineApi,
} from "@/lib/api/admin-settings";

import { CheckCircle2, Plus } from "lucide-react";

// ================= TYPES (MATCH BACKEND) =================
type AdminOrganization = {
  orgName: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  missionStatement: string;
  facebookLink: string;
  logoUrl?: string;
};

type AdminGuideline = {
  guideId: number;
  title: string;
  content: string;
  imageUrl?: string;
  priority: number;
};

export function AdminSettingsPage() {
  const [tab, setTab] = useState<"organization" | "guidelines">(
    "organization"
  );

  const [org, setOrg] = useState<AdminOrganization | null>(null);
  const [guidelines, setGuidelines] = useState<AdminGuideline[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;

  const [newGuideline, setNewGuideline] = useState({
    title: "",
    content: "",
    imageUrl: "",
    priority: guidelines.length + 1,
  });
  const [showNewGuideline, setShowNewGuideline] = useState(false);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [orgRes, guideRes] = await Promise.all([
          getOrganizationApi(),
          getGuidelinesApi(),
        ]);

        setOrg(orgRes);
        setGuidelines(guideRes);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ================= UI FEEDBACK =================
  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ================= SAVE ORGANIZATION =================
  const handleOrgSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!org) return;

    await saveOrganizationApi(org);
    flashSaved();
  };

  // ================= UPDATE GUIDELINE =================
  const handleGuidelineSave = async (item: AdminGuideline) => {
    await updateGuidelineApi(item.guideId, {
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
      priority: item.priority,
    });

    const refreshed = await getGuidelinesApi();
    setGuidelines(refreshed);

    flashSaved();
  };

  const handleGuidelineDelete = async (guideId: number) => {
    if (!confirm("Delete this guideline?")) return;

    await deleteGuidelineApi(guideId);

    setGuidelines((prev) =>
      prev.filter((g) => g.guideId !== guideId)
    );

    flashSaved();
  };

  // ================= ADD GUIDELINE =================
  const addGuideline = async () => {
    const created = await createGuidelineApi(newGuideline);

    setGuidelines((prev) => [...prev, created]);

    setShowNewGuideline(false);

    flashSaved();
  };

  // ================= LOADING STATE =================
  if (loading || !org) {
    return (
      <div className="p-6 text-slate-400 text-sm">
        Loading settings...
      </div>
    );
  }

  const sortedGuidelines = [...guidelines].sort(
    (a, b) => b.guideId - a.guideId
  );

  const totalPages = Math.ceil(
    sortedGuidelines.length / PAGE_SIZE
  );

  const currentGuidelines = sortedGuidelines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      {/* HEADER */}
      <AdminPageHeader
        title="Site settings"
        description="Organization profile and adoption guidelines shown on the public site."
        badge="Admin"
      />

      {/* SAVED STATE */}
      {saved && (
        <div className="admin-panel mb-6 flex items-center gap-2 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} />
          Saved successfully
        </div>
      )}

      {/* TABS */}
      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "organization", label: "Organization" },
          { id: "guidelines", label: "Adoption guidelines" },
        ]}
        className="mb-6"
      />

      {/* ================= ORGANIZATION ================= */}
      {tab === "organization" && (
        <form
          onSubmit={handleOrgSubmit}
          className="admin-panel space-y-5 p-6"
        >
          <AdminFieldGrid cols={2}>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Organization name</label>
              <input
                className={adminInputClass()}
                value={org.orgName}
                onChange={(e) =>
                  setOrg({ ...org, orgName: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Hotline</label>
              <input
                className={adminInputClass()}
                value={org.hotline}
                onChange={(e) =>
                  setOrg({ ...org, hotline: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Email</label>
              <input
                className={adminInputClass()}
                value={org.email}
                onChange={(e) =>
                  setOrg({ ...org, email: e.target.value })
                }
              />
            </div>
          </AdminFieldGrid>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Address</label>
            <textarea
              className={adminInputClass("min-h-[80px]")}
              value={org.address}
              onChange={(e) =>
                setOrg({ ...org, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Mission statement</label>
            <textarea
              className={adminInputClass("min-h-[100px]")}
              value={org.missionStatement}
              onChange={(e) =>
                setOrg({
                  ...org,
                  missionStatement: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Facebook link</label>
            <input
              className={adminInputClass()}
              value={org.facebookLink}
              onChange={(e) =>
                setOrg({
                  ...org,
                  facebookLink: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Logo URL</label>
            <input
              className={adminInputClass()}
              value={org.logoUrl ?? ""}
              onChange={(e) =>
                setOrg({
                  ...org,
                  logoUrl: e.target.value,
                })
              }
            />
          </div>

          <button type="submit" className="admin-btn-primary">
            Save organization
          </button>
        </form>
      )}

      {/* ================= GUIDELINES ================= */}
      {tab === "guidelines" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              className="admin-btn-secondary gap-2"
              onClick={() => {
                setNewGuideline({
                  title: "",
                  content: "",
                  imageUrl: "",
                  priority: guidelines.length + 1,
                });
                setShowNewGuideline(true);
              }}
            >
              <Plus size={16} />
              Add guideline
            </button>
          </div>

          {showNewGuideline && (
            <AdminPanel title="New Guideline">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Title
                  </label>
                  <input
                    className={adminInputClass()}
                    value={newGuideline.title}
                    onChange={(e) =>
                      setNewGuideline({
                        ...newGuideline,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Priority
                  </label>
                  <input
                    type="number"
                    className={adminInputClass()}
                    value={newGuideline.priority}
                    onChange={(e) =>
                      setNewGuideline({
                        ...newGuideline,
                        priority: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Content
                  </label>
                  <textarea
                    className={adminInputClass("min-h-[90px]")}
                    value={newGuideline.content}
                    onChange={(e) =>
                      setNewGuideline({
                        ...newGuideline,
                        content: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={addGuideline}
                  >
                    Create
                  </button>

                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setShowNewGuideline(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </AdminPanel>
          )}

          {currentGuidelines.map((g) => (
            <AdminPanel
              key={g.guideId}
              title={`Priority ${g.priority} · ${g.title}`}
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Title
                  </label>
                  <input
                    className={adminInputClass()}
                    value={g.title}
                    onChange={(e) =>
                      setGuidelines((prev) =>
                        prev.map((x) =>
                          x.guideId === g.guideId
                            ? { ...x, title: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Priority
                  </label>
                  <input
                    type="number"
                    className={adminInputClass()}
                    value={g.priority}
                    onChange={(e) =>
                      setGuidelines((prev) =>
                        prev.map((x) =>
                          x.guideId === g.guideId
                            ? {
                                ...x,
                                priority: Number(e.target.value),
                              }
                            : x
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Content
                  </label>
                  <textarea
                    className={adminInputClass("min-h-[120px]")}
                    value={g.content}
                    onChange={(e) =>
                      setGuidelines((prev) =>
                        prev.map((x) =>
                          x.guideId === g.guideId
                            ? {
                                ...x,
                                content: e.target.value,
                              }
                            : x
                        )
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">
                    Image URL
                  </label>
                  <input
                    className={adminInputClass()}
                    value={g.imageUrl ?? ""}
                    onChange={(e) =>
                      setGuidelines((prev) =>
                        prev.map((x) =>
                          x.guideId === g.guideId
                            ? {
                                ...x,
                                imageUrl: e.target.value,
                              }
                            : x
                        )
                      )
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => handleGuidelineDelete(g.guideId)}
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => handleGuidelineSave(g)}
                  >
                    Save guideline
                  </button>
                </div>
              </div>
            </AdminPanel>
          ))}
          <div className="mt-6 flex justify-center gap-2">
            <button
              className="admin-btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-slate-300">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              className="admin-btn-secondary"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}