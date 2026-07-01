import { FormEvent, useState } from "react";
import { submitContactMessage } from "@/lib/api/contact-api";
import { ApiError } from "@/lib/api-client";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/useOrganization";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { CheckCircle2, Heart, Mail, MapPin, Phone } from "lucide-react";

export const ContactPage = () => {
  const org = useOrganization();
  const { user } = usePublicAuth(); 
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const subjectOptions = [
    { value: "ADOPTION", label: "Adoption Inquiry" },
    { value: "VOLUNTEER", label: "Volunteer Application" },
    { value: "DONATION", label: "Donation Support" },
    { value: "PARTNERSHIP", label: "Partnership / Cooperation" },
    { value: "OTHER", label: "Other Questions" },
  ];

  const contactItems = [
    { icon: MapPin, label: "Address PawsHope", value: org.address },
    { icon: Phone, label: "Hotline", value: org.hotline, highlight: true },
    { icon: Mail, label: "Email", value: org.email },
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: user ? user.fullName : String(fd.get("name") || ""),
      email: user ? user.email : String(fd.get("email") || ""),
      subject: String(fd.get("subject") || "OTHER"),
      message: String(fd.get("message") || ""),
    };

    try {
      await submitContactMessage(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "mt-1.5 rounded-2xl border-[#2c5f51]/10 bg-white/90 focus-visible:ring-[#f6931d]/20";

  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="Questions about adoption, volunteering, or partnerships? We'd love to hear from you."
      />

      <section className="public-section soft-section-warm">
        <div className="public-container">
          <div className="public-split-grid lg:gap-14">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="soft-label">Say hello</p>
                <h2 className="soft-heading-lg text-2xl">Get in touch</h2>
                <p className="soft-subtext leading-relaxed">
                  Please contact us if you have questions about adoption, 
                  the volunteer onboarding process, or need general assistance. 
                  We will respond within 24 business hours.
                </p>
              </div>

              <ul className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value, highlight }) => (
                  <li key={label} className="soft-stat flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#fef0df] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#c97a12]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#3d6b5c] text-sm">{label}</p>
                      <p className={`text-sm mt-0.5 ${highlight ? "text-[#c97a12] font-medium" : "soft-subtext"}`}>
                        {value}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div id="donate" className="rounded-[1.75rem] bg-gradient-to-br from-[#3d6b5c] to-[#5a8675] text-white p-7 shadow-[0_12px_40px_rgba(61,107,92,0.18)]">
                <div className="flex items-center gap-2 text-[#ffd4a8] mb-2">
                  <Heart size={18} className="fill-[#ffd4a8]/30" />
                  <h3 className="font-medium text-lg">Support our work</h3>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Your support helps us rescue, rehabilitate, and rehome animals in need.
                </p>
              </div>
            </div>

            <div className="soft-form-panel">
              <div className="mb-8 space-y-1">
                <p className="soft-label">Write to us</p>
                <h2 className="soft-heading-lg text-2xl">Send a message</h2>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#e6f2ec] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-[#3d6b5c]" size={36} />
                  </div>
                  <p className="font-medium text-[#3d6b5c]">Message sent successfully!</p>
                  <p className="text-sm soft-subtext px-4">
                    Thank you for reaching out to PawsHope Rescue. Our team will review your message and respond via email shortly.
                  </p>
                  <Button type="button" variant="outline" className="mt-2 rounded-full border-[#2c5f51]/20 hover:bg-white text-[#2c5f51]" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {submitError}
                    </p>
                  ) : null}
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Name</label>
                    {user ? (
                      <div className="p-3 mt-1.5 rounded-2xl bg-[#e6f2ec]/40 text-[#2c5f51] border border-[#2c5f51]/10 font-medium text-sm">
                        {user.fullName} 
                      </div>
                    ) : (
                      <Input name="name" required placeholder="Your name" className={fieldClass} />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Email</label>
                    {user ? (
                      <div className="p-3 mt-1.5 rounded-2xl bg-[#e6f2ec]/40 text-[#2c5f51] border border-[#2c5f51]/10 text-sm">
                        {user.email}
                      </div>
                    ) : (
                      <Input name="email" required type="email" placeholder="you@email.com" className={fieldClass} />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Subject</label>
                    <select
                      name="subject"
                      required
                      className={`${fieldClass} flex h-11 w-full px-4 text-sm bg-white border rounded-2xl outline-none focus:border-[#f6931d]/40`}
                    >
                      {subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Message</label>
                    <Textarea name="message" required placeholder="How can we help?" className={fieldClass} />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#f6931d]/95 hover:bg-[#f6931d] font-medium h-11 shadow-[0_6px_20px_rgba(246,147,29,0.25)] text-white"
                  >
                    {loading ? "Sending..." : "Send message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};