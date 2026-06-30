import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { mockAdoptions } from "@/data/admin-mock";
import { loadAdoptions } from "@/lib/admin/admin-data";
import { ChevronRight, ChevronLeft, Search } from "lucide-react"; 
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 20; 

export function AdminAdoptionsPage() {
  const [adoptions, setAdoptions] = useState(mockAdoptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 

  useEffect(() => {
    void loadAdoptions().then(setAdoptions);
  }, []);

  const getStatusPriority = (status: string) => {
    switch (status) {
      case "PENDING":
      case "SUBMITTED":
        return 1;
      case "APPROVED":
      case "COMPLETED":
        return 2;
      case "REJECTED":
      case "CANCELLED":
        return 3;
      default:
        return 1;
    }
  };

  const filteredAndSortedAdoptions = adoptions
    .filter((a) => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        a.application_code?.toLowerCase().includes(lowerSearch) ||
        a.pet_name?.toLowerCase().includes(lowerSearch) ||
        a.applicant_name?.toLowerCase().includes(lowerSearch) ||
        a.applicant_email?.toLowerCase().includes(lowerSearch) ||
        a.applicant_phone?.toLowerCase().includes(lowerSearch)
      );
    })
    .sort((a, b) => {
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(b.apply_date).getTime() - new Date(a.apply_date).getTime();
    });

  const totalPages = Math.ceil(filteredAndSortedAdoptions.length / ITEMS_PER_PAGE);
  
  const paginatedAdoptions = filteredAndSortedAdoptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <AdminPageHeader
        title="Adoptions"
        description="Open an application to review full details, meetings, handover, and follow-ups."
      />

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search by application code, pet, applicant name, email, phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
          className="block w-full pl-10 pr-3 py-2 border border border-slate-700 rounded-md leading-5 bg-[#0f172a] text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-[#1e293b] focus:border-[#f6931d] focus:ring-1 focus:ring-[#f6931d] sm:text-sm transition-colors"
        />
      </div>

      <div className="space-y-3">
        {paginatedAdoptions.map((a) => (
          <Link
            key={a.adoption_id}
            to={`/admin/adoptions/${a.adoption_id}`}
            className="admin-card-hover block p-4 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="font-medium text-white group-hover:text-[#f6931d]">
                  {a.application_code} — {a.pet_name}
                </p>
                <p className="text-sm text-slate-400">
                  {a.applicant_name} · {a.applicant_email} · {a.applicant_phone}
                </p>
                <p className="text-xs text-slate-500">Applied {a.apply_date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={a.status} />
                <StatusBadge value={a.priority_level} />
                <StatusBadge value={a.payment_status} />
                <ChevronRight size={18} className="text-slate-600 group-hover:text-[#f6931d]" />
              </div>
            </div>
          </Link>
        ))}
        
        {filteredAndSortedAdoptions.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No adoptions found matching "{searchTerm}"
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 mt-6 gap-4 text-sm text-slate-400">
            <div>
              Showing <span className="text-slate-200 font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{" "}
              <span className="text-slate-200 font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedAdoptions.length)}
              </span>{" "}
              of <span className="text-slate-200 font-medium">{filteredAndSortedAdoptions.length}</span> results
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-700 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-slate-300 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-700 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}