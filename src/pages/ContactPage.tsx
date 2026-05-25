import { FormEvent, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { organization } from "@/data/mock";
import { CheckCircle2, Heart, Mail, MapPin, Phone } from "lucide-react";

const contactItems = [
  { icon: MapPin, label: "Sanctuary address", value: organization.address },
  { icon: Phone, label: "Hotline", value: organization.hotline, highlight: true },
  { icon: Mail, label: "Email", value: organization.email },
];

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                  Reach out for adoption inquiries, volunteer onboarding, media requests, or general
                  support. We typically respond within 1–2 business days.
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
                      <p
                        className={`text-sm mt-0.5 ${highlight ? "text-[#c97a12] font-medium" : "soft-subtext"}`}
                      >
                        {value}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div
                id="donate"
                className="rounded-[1.75rem] bg-gradient-to-br from-[#3d6b5c] to-[#5a8675] text-white p-7 scroll-mt-24 shadow-[0_12px_40px_rgba(61,107,92,0.18)]"
              >
                <div className="flex items-center gap-2 text-[#ffd4a8] mb-2">
                  <Heart size={18} className="fill-[#ffd4a8]/30" />
                  <h3 className="font-medium text-lg">Support our work</h3>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Bank transfer details and donation campaigns will appear here once the team API is
                  connected. Every contribution funds rescue, medical care, and shelter operations.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-sm font-mono text-white/90 border border-white/10">
                  PawsHopeNet · Demo account · 0000 0000 0000
                </div>
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
                  <p className="font-medium text-[#3d6b5c]">Message sent (preview)</p>
                  <p className="text-sm soft-subtext">Form submission will connect to API later.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Name</label>
                    <Input required placeholder="Your name" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Email</label>
                    <Input required type="email" placeholder="you@email.com" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Subject</label>
                    <Input required placeholder="Adoption / Volunteer / Other" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5a6b60]">Message</label>
                    <Textarea required placeholder="How can we help?" className={fieldClass} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-[#f6931d]/95 hover:bg-[#f6931d] font-medium h-11 shadow-[0_6px_20px_rgba(246,147,29,0.25)]"
                  >
                    Send message
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
