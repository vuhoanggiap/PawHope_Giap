import { formatCell } from "@/lib/adminFormat";
import { cn } from "@/lib/utils";

interface AdminDataTableProps {
  rows: Record<string, unknown>[];
  columns?: { key: string; label?: string }[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function AdminDataTable({ rows, columns, onRowClick }: AdminDataTableProps) {
  if (rows.length === 0) {
    return <p className="admin-empty">No records found.</p>;
  }

  const cols =
    columns ??
    Object.keys(rows[0]).map((key) => ({
      key,
      label: key.replace(/_/g, " "),
    }));

  return (
    <div className="admin-table-wrap">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-500">
            {cols.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium capitalize">
                {col.label ?? col.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn("text-slate-200", onRowClick && "cursor-pointer")}
            >
              {cols.map((col) => (
                <td key={col.key} className="max-w-[260px] truncate px-4 py-3">
                  {formatCell(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
