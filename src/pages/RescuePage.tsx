import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveRescueReport } from "@/lib/public-store";
import { AlertTriangle, CheckCircle2, ImagePlus, MapPin, Phone, Sparkles } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";

const steps = [
  "Your report is logged with date, location, and photos.",
  "A coordinator assigns priority (urgent or standard).",
  "The nearest available volunteer confirms on-site status.",
  "The animal is stabilized and brought to the sanctuary if needed.",
];

export const RescuePage = () => {
  const org = useOrganization();
  const { user } = usePublicAuth();
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const fd = new FormData(e.currentTarget);
    const note = String(fd.get("note") || "").trim();

    if (!imageFile) {
      setSubmitError("Please upload a photo of the animal or scene.");
      return;
    }
    if (!note) {
      setSubmitError("Please describe the situation in additional details.");
      return;
    }

    setSubmitting(true);
    try {
      const report = await saveRescueReport({
        user_id: user?.userId,
        reporter_name: String(fd.get("name") || ""),
        reporter_phone: String(fd.get("phone") || ""),
        location_text: String(fd.get("location") || ""),
        urgency_level: String(fd.get("urgency") || "MEDIUM"),
        injury_type: String(fd.get("injury") || "NONE"),
        temperament: String(fd.get("temperament") || "SCARED"),
        behavior: String(fd.get("behavior") || "ACTIVE"),
        additional_note: note,
        image_file: imageFile,
      });
      setTrackingCode(report.tracking_code);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "mt-1.5 rounded-2xl border-[#2c5f51]/10 bg-white/90 focus-visible:ring-[#f6931d]/20";

  return (
    <>
      <PageHero
        title="Report a rescue"
        subtitle="See an injured, abandoned, or trapped animal? Tell us gently but quickly — every minute counts."
        imageUrl="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1600"
      />

      <section className="public-section-tight soft-section-warm">
        <div className="public-container">
          <div className="public-split-grid lg:grid-cols-5 lg:gap-10 xl:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-[1.5rem] bg-[#fff8ed] border border-[#f6931d]/15 p-5 flex gap-3">
                <AlertTriangle className="text-[#e8a045] shrink-0 mt-0.5" size={22} />
                <div className="text-sm text-[#6b5a45] leading-relaxed">
                  <strong className="text-[#3d6b5c]">Life-threatening emergency?</strong> Please call
                  our hotline first so we can dispatch a volunteer right away.
                </div>
              </div>

              <div className="soft-card p-6 space-y-5">
                <h2 className="font-medium text-[#3d6b5c] text-lg">What happens next</h2>
                <ol className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm soft-subtext leading-relaxed">
                      <span className="w-7 h-7 rounded-full bg-[#e6f2ec] text-[#3d6b5c] text-xs font-medium flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <Link
                to="/rescue/track"
                className="block soft-card-hover p-5 text-center text-sm font-medium text-[#3d6b5c]"
              >
                Already have a code? <span className="text-[#f6931d]">Track your report →</span>
              </Link>

              <div className="rounded-[1.75rem] bg-gradient-to-br from-[#3d6b5c] to-[#4a7566] text-white p-6 space-y-4 shadow-[0_12px_40px_rgba(61,107,92,0.2)]">
                <div className="flex items-center gap-2 text-[#ffd4a8]">
                  <Sparkles size={18} />
                  <h3 className="font-medium">Rescue hotline</h3>
                </div>
                <p className="flex items-center gap-2 text-xl font-medium">
                  <Phone size={20} className="text-[#ffd4a8]" /> {org.hotline}
                </p>
                <p className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                  <MapPin size={18} className="shrink-0 mt-0.5 text-[#ffd4a8]" /> {org.address}
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="soft-form-panel">
                <div className="mb-8 space-y-1">
                  <p className="soft-label">Help is on the way</p>
                  <h2 className="soft-heading-lg text-2xl">Rescue report form</h2>
                </div>

                {trackingCode ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#e6f2ec] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="text-[#3d6b5c]" size={36} />
                    </div>
                    <p className="font-medium text-[#3d6b5c] text-lg">Report received</p>
                    <p className="text-sm soft-subtext">Save this tracking code:</p>
                    <p className="text-2xl font-bold text-[#f6931d] tracking-wide">{trackingCode}</p>
                    <Button asChild className="rounded-full bg-[#2c5f51] hover:bg-[#3d6b5c] mt-4">
                      <Link to={`/rescue/track/${trackingCode}`}>Track status →</Link>
                    </Button>
                    {user ? (
                      <p className="text-xs soft-subtext">
                        Also listed under{" "}
                        <Link to="/account/rescue-reports" className="text-[#f6931d] underline">
                          My rescue reports
                        </Link>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError ? (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                      </p>
                    ) : null}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Your name</label>
                        <Input
                          name="name"
                          required
                          defaultValue={user?.fullName}
                          placeholder="Reporter name"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Phone number</label>
                        <Input
                          name="phone"
                          required
                          defaultValue={user?.phone}
                          placeholder="+84 ..."
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a6b60]">Location / address</label>
                      <Input name="location" required placeholder="Street, district, city" className={fieldClass} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Urgency</label>
                        <select name="urgency" required className={`${fieldClass} flex h-11 w-full px-4 text-sm`}>
                          <option value="CRITICAL">Critical</option>
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Injury type</label>
                        <select name="injury" required className={`${fieldClass} flex h-11 w-full px-4 text-sm`}>
                          <option value="NONE">None visible</option>
                          <option value="BLEEDING">Bleeding</option>
                          <option value="BROKEN_BONE">Broken bone</option>
                          <option value="DISEASE">Illness / disease</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Temperament</label>
                        <select name="temperament" required className={`${fieldClass} flex h-11 w-full px-4 text-sm`}>
                          <option value="FRIENDLY">Friendly</option>
                          <option value="SCARED">Scared</option>
                          <option value="AGGRESSIVE">Aggressive</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#5a6b60]">Behavior</label>
                        <select name="behavior" required className={`${fieldClass} flex h-11 w-full px-4 text-sm`}>
                          <option value="ACTIVE">Active / mobile</option>
                          <option value="IMMOBILE">Immobile</option>
                          <option value="LIMPING">Limping</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a6b60]">Additional details</label>
                      <Textarea
                        name="note"
                        required
                        placeholder="Condition, access notes, landmarks, best time to reach you..."
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a6b60]">
                        Photo <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1.5 space-y-3">
                        <label
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition-colors ${
                            imageFile
                              ? "border-[#3d6b5c] bg-[#e6f2ec]/40"
                              : "border-[#2c5f51]/15 bg-white/90 hover:border-[#f6931d]/40"
                          }`}
                        >
                          <ImagePlus className="mb-2 text-[#3d6b5c]" size={28} />
                          <span className="text-sm font-medium text-[#3d6b5c]">
                            {imageFile ? imageFile.name : "Tap to upload a photo"}
                          </span>
                          <span className="mt-1 text-xs text-[#a8b8ae]">JPG, PNG or WEBP — required</span>
                          <input
                            type="file"
                            accept="image/*"
                            required
                            className="sr-only"
                            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 w-full rounded-2xl object-cover border border-[#2c5f51]/10"
                          />
                        ) : null}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-[#f6931d]/95 hover:bg-[#f6931d] font-medium h-12 shadow-[0_6px_20px_rgba(246,147,29,0.3)] disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit rescue report"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
