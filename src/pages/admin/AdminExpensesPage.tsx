import { useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockExpenses } from "@/data/admin-mock";
import { formatEnum } from "@/lib/adminFormat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminExpensesPage() {
  const [expenses] = useState(mockExpenses);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <AdminPageHeader title="Expenses" description="Track sanctuary spending with receipts." badge="Admin" />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="admin-stat-card p-5 lg:col-span-1">
          <p className="text-sm text-slate-400">Sample period total</p>
          <p className="mt-1 text-2xl font-semibold text-white">{total.toLocaleString("vi-VN")} ₫</p>
        </div>

        <AdminPanel title="Add expense (preview)" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <select className={adminInputClass("mt-1")}>
                {["FOOD", "MEDICAL", "UTILITY", "FACILITY", "OTHER"].map((c) => (
                  <option key={c}>{formatEnum(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Amount (₫)</label>
              <Input placeholder="0" className="admin-input mt-1 h-10" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Expense date</label>
              <Input type="date" className="admin-input mt-1 h-10" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Receipt image URL</label>
              <Input placeholder="https://..." className="admin-input mt-1 h-10" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Description</label>
              <Textarea placeholder="What was purchased..." className="admin-input mt-1 min-h-[88px]" />
            </div>
          </div>
          <Button className="mt-4 bg-gradient-to-r from-[#2c5f51] to-[#3d6b5c] shadow-lg shadow-[#2c5f51]/15 hover:from-[#3d6b5c] hover:to-[#2c5f51]">Save expense (preview)</Button>
        </AdminPanel>
      </div>

      <AdminDataTable
        rows={expenses.map((e) => ({
          id: e.expense_id,
          category: e.category,
          description: e.description,
          amount: e.amount.toLocaleString("vi-VN") + " ₫",
          date: e.expense_date,
          receipt: e.receipt_image_url ? "Yes" : "—",
          recorded_by: e.recorded_by,
        }))}
        columns={[
          { key: "id", label: "ID" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
          { key: "amount", label: "Amount" },
          { key: "date", label: "Date" },
          { key: "receipt", label: "Receipt" },
          { key: "recorded_by", label: "By" },
        ]}
      />
    </div>
  );
}
