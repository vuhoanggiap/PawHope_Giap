import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = usePublicAuth();
  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(username, password)) {
      setError("Invalid username or password.");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <>
      <PageHero
        title="Sign in"
        subtitle="Track adoptions, rescue reports, and shop orders in one place."
        imageUrl="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600"
      />

      <section className="public-section-tight bg-[#fdfaf5]">
        <div className="public-container-narrow max-w-md">
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-[#2c5f51] rounded-full flex items-center justify-center">
                <PawPrint size={28} className="text-[#f6931d] fill-[#f6931d]" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              ) : null}
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="user1"
                  className="mt-1"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full bg-[#2c5f51] hover:bg-green-800 font-bold h-11">
                Sign in
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Demo: <code className="text-gray-600">user1 / user123</code>
              </p>
              <p className="text-center text-sm text-gray-500">
                No account?{" "}
                <Link to="/register" className="text-[#f6931d] font-bold hover:underline">
                  Create one
                </Link>
              </p>
              <p className="text-center text-xs text-gray-400">
                Staff?{" "}
                <Link to="/admin/login" className="text-[#2c5f51] hover:underline">
                  Admin sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
