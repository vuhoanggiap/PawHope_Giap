import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    // 🌟 FIX QUYẾT ĐỊNH: Đổi min-h-screen sang h-screen và overflow-hidden để khóa cứng khung layout, chống giật
    <div className="admin-shell flex h-screen w-full overflow-hidden bg-[#0c1218]">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      {/* Sidebar luôn nằm im cố định ở vị trí sticky/fixed không bị ảnh hưởng chiều cao */}
      <AdminSidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

      {/* 🌟 FIX TIẾP THEO: Khóa h-full và overflow-hidden để vùng nội dung độc lập hoàn toàn với Sidebar */}
      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-[#0c1218]/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <button
            type="button"
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-200 transition-colors hover:bg-white/[0.08]"
            aria-expanded={mobileNavOpen}
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-[#f6931d]">PawsHope Admin</span>
        </header>

        {/* 🌟 FIX BỔ TRỢ: Đổi flex-1 sang h-full overflow-y-auto để thanh cuộn scroll chỉ chạy riêng ở vùng nội dung */}
        <div className="h-full w-full overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}