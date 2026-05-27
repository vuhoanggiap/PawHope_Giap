import { apiFetch } from "@/lib/api-client";

export type ExpenseResDto = {
  expenseId: number;
  category: string;
  amount: number;
  description: string;
  expenseDate?: string;
  receiptImageUrl?: string;
  createdBy?: number;
  createdAt?: string;
};

export async function fetchExpenses() {
  return apiFetch<ExpenseResDto[]>("/expenses");
}

export type CreateExpenseBody = {
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
  receiptImageUrl?: string;
  createdBy?: number;
};

export async function createExpense(body: CreateExpenseBody) {
  return apiFetch<ExpenseResDto>("/expenses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
