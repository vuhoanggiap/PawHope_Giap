import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

export const VolunteerApplyPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        title="Volunteer application"
        subtitle="Help with rescue runs, shelter care, events, and community outreach."
        imageUrl="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600"
      />

      <section className="public-section bg-white">
        <div className="public-container-narrow">
          <div className="mb-10 space-y-3 text-gray-600">
            <p>
              Volunteers are the backbone of PawsHopeNet. Tell us about your availability, skills, and
              why you want to join. Applications are reviewed weekly.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#fdfaf5] rounded-2xl border p-12 text-center space-y-3">
              <CheckCircle2 className="mx-auto text-green-600" size={48} />
              <p className="font-bold text-[#2c5f51] text-xl">Application submitted (preview)</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                When the API is ready, your application will enter the volunteer review queue.
              </p>
              <Button asChild className="mt-4 bg-[#f6931d] hover:bg-orange-600">
                <Link to="/">Return home</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-[#fdfaf5] p-5 sm:p-8">
              <div className="public-form-grid">
                <div>
                  <label className="text-sm font-medium">Full name</label>
                  <Input required placeholder="Jane Doe" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input required type="email" placeholder="you@email.com" className="mt-1" />
                </div>
              </div>

              <div className="public-form-grid">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input required placeholder="+84 ..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input required placeholder="Hanoi" className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred roles</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Rescue dispatch", "Shelter care", "Adoption events", "Social media", "Transport"].map(
                    (role) => (
                      <label
                        key={role}
                        className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm cursor-pointer hover:border-[#f6931d]"
                      >
                        <input type="checkbox" className="accent-[#f6931d]" />
                        {role}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Weekly availability</label>
                <Textarea
                  required
                  placeholder="e.g. Weekends, Tue/Thu evenings, flexible for urgent rescues..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Experience with animals</label>
                <Textarea
                  required
                  placeholder="Past volunteering, pets at home, relevant skills..."
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full bg-[#2c5f51] hover:bg-green-800 font-bold h-12">
                Submit application
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};
