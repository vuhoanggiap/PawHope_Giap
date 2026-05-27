import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = usePublicAuth();
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const ok = await register({
      username: String(fd.get("username") || ""),
      password: String(fd.get("password") || ""),
      fullName: String(fd.get("fullName") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || "") || undefined,
    });
    if (!ok) {
      setError(
        "Could not create account. Username may be taken, password too short (min 6), or API unavailable."
      );
      return;
    }
    navigate("/account", { replace: true });
  };

  return (
    <>
      <PageHero
        title="Create account"
        subtitle="Register to apply for adoption and manage your activity."
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
                <label className="text-sm font-medium">Full name</label>
                <Input name="fullName" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input name="username" required minLength={3} className="mt-1" autoComplete="username" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone (optional)</label>
                <Input name="phone" placeholder="+84 ..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" required minLength={6} className="mt-1" />
              </div>
              <Button type="submit" className="w-full bg-[#2c5f51] hover:bg-green-800 font-bold h-11">
                Create account
              </Button>
              <p className="text-center text-sm text-gray-500">
                Already registered?{" "}
                <Link to="/login" className="text-[#f6931d] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
