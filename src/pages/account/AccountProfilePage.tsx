import { FormEvent, useState } from "react";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export function AccountProfilePage() {
  const { user, updateProfile } = usePublicAuth();
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="soft-card p-6 md:p-8">
      <h2 className="soft-heading text-lg mb-1">Profile</h2>
      <p className="soft-subtext text-sm mb-6">Update your contact details for adoption and rescue follow-ups.</p>

      {saved ? (
        <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={18} /> Profile saved locally (mock).
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-[#5a6b60]">Username</label>
          <Input value={user.username} disabled className="mt-1 rounded-2xl bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#5a6b60]">Full name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 rounded-2xl border-[#2c5f51]/10"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#5a6b60]">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 rounded-2xl border-[#2c5f51]/10"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#5a6b60]">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 rounded-2xl border-[#2c5f51]/10"
          />
        </div>
        <Button type="submit" className="rounded-full bg-[#2c5f51] hover:bg-[#3d6b5c] font-medium">
          Save changes
        </Button>
      </form>
    </div>
  );
}
