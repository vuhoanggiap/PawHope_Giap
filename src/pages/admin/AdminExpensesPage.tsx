import { FormEvent, useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPanel } from "@/components/admin/AdminDetailUi";
import { adminInputClass } from "@/components/admin/AdminControls";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockExpenses } from "@/data/admin-mock";
import { loadExpenses, saveExpenseRecord } from "@/lib/admin/admin-data";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { formatEnum } from "@/lib/adminFormat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [category, setCategory] = useState("FOOD");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptUrl, setReceiptUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => void loadExpenses().then(setExpenses);

  useEffect(() => {
    refresh();
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    if (USE_MOCK) {
      setMessage("Saved locally (mock mode).");
      return;
    }
    void saveExpenseRecord({
      category,
      amount: parsed,
      description: description.trim() || undefined,
      expenseDate,
      receiptImageUrl: receiptUrl.trim() || undefined,
    })
      .then(() => {
        setMessage("Expense recorded.");
        setAmount("");
        setDescription("");
        refresh();
      })
      .catch((err) => setMessage(err instanceof ApiError ? err.message : "Save failed"));
  };

  return (
    <div>
      <AdminPageHeader title="Expenses" description="Track sanctuary spending with receipts." badge="Admin" />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="admin-stat-card p-5 lg:col-span-1">
          <p className="text-sm text-slate-400">Period total</p>
          <p className="mt-1 text-2xl font-semibold text-white">{total.toLocaleString("vi-VN")} ₫</p>
        </div>

        <AdminPanel title="Add expense" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={adminInputClass("mt-1")}
              >
                {["FOOD", "MEDICAL", "UTILITY", "FACILITY", "OTHER"].map((c) => (
                  <option key={c} value={c}>
                    {formatEnum(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Amount (₫)</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="admin-input mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Expense date</label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="admin-input mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Receipt image URL</label>
              <Input
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://..."
                className="admin-input mt-1 h-10"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was purchased..."
                className="admin-input mt-1 min-h-[88px]"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4">
              <Button type="submit" className="admin-btn-primary">
                Save expense
              </Button>
              {message ? <p className="text-xs text-slate-400">{message}</p> : null}
            </div>
          </form>
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
