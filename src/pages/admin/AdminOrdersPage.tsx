import { Link } from "react-router-dom";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockOrders } from "@/data/admin-mock";
import { loadOrders } from "@/lib/admin/admin-data";
import { ChevronRight, ChevronLeft, Search, Filter } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await loadOrders();
        const sorted = [...list].sort((a, b) => b.order_id - a.order_id);

        if (!cancelled) {
          setOrders(sorted);
        }
      } catch (err) {
        console.error("Load orders failed", err);
      }
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const uniqueStatuses = useMemo(() => {
    const statuses = orders.map((o) => o.order_status);
    return ["all", ...Array.from(new Set(statuses))];
  }, [orders]);

  return (
    <div>
      <AdminPageHeader
        title="Shop orders"
        description="Open an order for shipping and payment details."
        badge="Admin"
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-[#f6931d] focus:ring-1 focus:ring-[#f6931d]"
          />
        </div>

        <div className="relative min-w-[160px]">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/[0.06] bg-[#1e293b] py-2 pl-10 pr-8 text-sm text-white outline-none focus:border-[#f6931d]"
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status} className="bg-slate-900">
                {status === "all" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {currentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-white/[0.06] rounded-lg">
            No matching orders found.
          </div>
        ) : (
          currentOrders.map((o) => (
            <Link
              key={o.order_id}
              to={`/admin/orders/${o.order_id}`}
              className="admin-card-hover group flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium text-white group-hover:text-[#f6931d]">
                  Order #{o.order_id}
                </p>
                <p className="text-sm text-slate-400">
                  {o.customer_name} · {o.created_at}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-white">
                  {o.total_amount.toLocaleString()} ₫
                </span>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/[0.06]">
                  {o.order_status}
                </span>
                <ChevronRight size={18} className="text-slate-600" />
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8">
        <AdminDataTable
          rows={currentOrders.map((o) => ({
            id: o.order_id,
            customer: o.customer_name,
            payment: o.payment_status,
            order: o.order_status,
            total: o.total_amount.toLocaleString() + " ₫",
          }))}
          columns={[
            { key: "id", label: "ID" },
            { key: "customer", label: "Customer" },
            { key: "payment", label: "Payment" },
            { key: "order", label: "Order status" },
            { key: "total", label: "Total" },
          ]}
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <p className="text-sm text-slate-400">
            Display <span className="text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="text-white">
              {Math.min(indexOfLastItem, filteredOrders.length)}
            </span>{" "}
            in total <span className="text-white">{filteredOrders.length}</span> filtered orders
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-sm text-slate-300 mx-2">
              Page <span className="text-white font-medium">{currentPage}</span> / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}