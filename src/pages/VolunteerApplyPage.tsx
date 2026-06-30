import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { USE_MOCK } from "@/lib/api-client";
import { submitVolunteerApplication } from "@/lib/api/volunteer-applications-api";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { CheckCircle2 } from "lucide-react";

export const VolunteerApplyPage = () => {
  const { user } = usePublicAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);

    if (USE_MOCK) {
      setSubmitted(true);
      return;
    }

    try {
      const selectedDays = Array.from(fd.getAll("availableDays")).map(String).join(",");
      const selectedTasks = Array.from(fd.getAll("preferredTasks")).map(String).join(",");

      await submitVolunteerApplication({
        userId: user?.userId || undefined,
        full_name: String(fd.get("fullName") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        dateOfBirth: fd.get("dob") ? String(fd.get("dob")) : undefined, 
        address: String(fd.get("city") || ""),
        occupation: String(fd.get("occupation") || ""),                 
        skills: String(fd.get("skills") || ""),                       
        experienceWithAnimals: String(fd.get("experience") || ""),
        reasonToJoin: String(fd.get("reason") || ""), 
        availableDays: selectedDays, 
        preferredTasks: selectedTasks,
        has_transport: fd.get("hasTransport") === "1" ? 1 : 0,  
      });
      setSubmitted(true);
    } catch (err) {
      setError("Could not submit application. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
              Currently, PawsHope only accepts volunteers based in Hanoi. 
              We will respond to your application as soon as possible. Thank you!
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#fdfaf5] rounded-2xl border p-12 text-center space-y-3">
              <CheckCircle2 className="mx-auto text-green-600" size={48} />
              <p className="font-bold text-[#2c5f51] text-xl">Application submitted</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {USE_MOCK
                  ? "Preview mode — data was not sent to the server."
                  : "Your application was sent to PawsHopeNet for review."}
              </p>
              <Button asChild className="mt-4 bg-[#f6931d] hover:bg-orange-600">
                <Link to="/">Return home</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-[#fdfaf5] p-5 sm:p-8">
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              
              <div className="public-form-grid">
                <div>
                  <label className="text-sm font-medium">Full name</label>
                  <Input name="fullName" required placeholder="Enter your name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" required type="email" placeholder="Enter your email" className="mt-1" />
                </div>
              </div>

              <div className="public-form-grid">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input name="phone" required placeholder="Enter your phone number" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Date of birth</label>
                  <Input name="dob" type="date" required className="mt-1" />
                </div>
              </div>

              <div className="public-form-grid">
                <div>
                  <label className="text-sm font-medium">Your address (in Hanoi)</label>
                  <Input name="city" required placeholder="Enter your address" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Occupation</label>
                  <Input name="occupation" required placeholder="Student, Office worker..." className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Do you have personal transport? (Motorbike, Car...)</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="hasTransport" value="1" defaultChecked className="accent-[#f6931d]" />
                    Yes, I can drive/travel autonomously
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="hasTransport" value="0" className="accent-[#f6931d]" />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Available days in week</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { val: "MON", label: "Monday" },
                    { val: "TUE", label: "Tuesday" },
                    { val: "WED", label: "Wednesday" },
                    { val: "THU", label: "Thursday" },
                    { val: "FRI", label: "Friday" },
                    { val: "SAT", label: "Saturday" },
                    { val: "SUN", label: "Sunday" }
                  ].map((day) => (
                    <label
                      key={day.val}
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs cursor-pointer hover:border-[#f6931d]"
                    >
                      <input type="checkbox" name="availableDays" value={day.val} className="accent-[#f6931d]" />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred roles</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { val: "RESCUE", label: "Rescue Dispatch" },
                    { val: "FEEDING", label: "Feeding Animals" },
                    { val: "CLEANING", label: "Shelter Cleaning" },
                    { val: "MEDICAL_SUPPORT", label: "Medical Support" },
                    { val: "ADOPTION_SUPPORT", label: "Adoption Support" },
                    { val: "EVENT", label: "Events" },
                    { val: "TRANSPORT", label: "Transport" }
                  ].map((role) => (
                    <label
                      key={role.val}
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm cursor-pointer hover:border-[#f6931d]"
                    >
                      <input type="checkbox" name="preferredTasks" value={role.val} className="accent-[#f6931d]" />
                      {role.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Skills & Special Qualifications</label>
                <Textarea
                  name="skills"
                  required
                  placeholder="Photography, Medical care, Social media, driving license..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Experience with animals</label>
                <Textarea
                  name="experience"
                  required
                  placeholder="Past volunteering, pets at home, relevant skills..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reason to join</label>
                <Textarea
                  name="reason"
                  required
                  placeholder="Why do you want to volunteer with PawsHope? Tell us your motivation..."
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-[#2c5f51] hover:bg-green-800 font-bold h-12"
              >
                {isLoading ? "Submitting..." : "Submit application"} 
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};