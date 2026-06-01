import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, API_BASE, USE_MOCK } from "@/lib/api-client";
import { canAccessAdmin, getStoredAdmin, loginAdmin } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";
  const existing = getStoredAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (existing && canAccessAdmin(existing.role)) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await loginAdmin(email, password);
      if (!user) {
        setError(USE_MOCK ? "Invalid username or password." : "Invalid email or password.");
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          USE_MOCK ? "Sign-in failed." : `Cannot reach API (${API_BASE}). Is Spring Boot running?`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2c5f51] to-[#234a40] shadow-xl shadow-[#2c5f51]/25">
            <PawPrint className="h-9 w-9 fill-[#f6931d] text-[#f6931d]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Staff sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Admin & volunteer dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-card">
          {error ? (
            <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-400">
              {USE_MOCK ? "Username" : "Email"}
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type={USE_MOCK ? "text" : "email"}
              placeholder={USE_MOCK ? "admin" : "admin@pawshope.net"}
              className={cn(
                "admin-input mt-1.5 h-11 w-full bg-white !text-slate-900 placeholder:!text-slate-400"
              )}
              autoComplete={USE_MOCK ? "username" : "email"}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input mt-1.5 h-11 w-full bg-white !text-slate-900 placeholder:!text-slate-400"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full bg-gradient-to-r from-[#2c5f51] to-[#3d6b5c] font-medium shadow-lg shadow-[#2c5f51]/20 hover:from-[#3d6b5c] hover:to-[#2c5f51]"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <p className="pt-1 text-center text-xs text-slate-500">
            {USE_MOCK ? (
              <>
                Demo: <code className="text-slate-400">admin / admin123</code> or{" "}
                <code className="text-slate-400">volunteer1 / volunteer123</code>
              </>
            ) : (
              <>
                API: <code className="text-slate-400">{API_BASE}</code>
                <br />
                Demo: <code className="text-slate-400">admin@pawshope.net / admin123</code>
              </>
            )}
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="text-[#f6931d] transition-colors hover:underline">
            ← Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
