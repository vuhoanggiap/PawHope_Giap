import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { usePublicAuth } from "@/contexts/PublicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { adoptionGuidelines, genderLabel, mockPets, speciesLabel, type MockPet } from "@/data/mock";
import { USE_MOCK } from "@/lib/api-client";
import { fetchPetById } from "@/lib/api/pets-api";
import { saveAdoption } from "@/lib/public-store";
import { ArrowLeft, CheckCircle2, Heart } from "lucide-react";

export const AdoptPetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = usePublicAuth();
  const petId = Number(id);
  const [pet, setPet] = useState<MockPet | undefined>(() =>
    mockPets.find((p) => p.id === petId)
  );
  const [loadingPet, setLoadingPet] = useState(!USE_MOCK && petId > 0);
  const [submitted, setSubmitted] = useState<{ code: string; id: number } | null>(null);
  const [agreed, setAgreed] = useState(false);
  // State mới để điều khiển việc hiển thị form
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (USE_MOCK || !petId) return;
    setLoadingPet(true);
    void fetchPetById(petId)
      .then(setPet)
      .catch(() => setPet(mockPets.find((p) => p.id === petId)))
      .finally(() => setLoadingPet(false));
  }, [petId]);

  if (loadingPet) {
    return (
      <div className="public-container py-16 text-center sm:py-24">
        <p className="soft-subtext">Loading pet profile…</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="public-container py-16 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-[#2c5f51]">Pet not found</h1>
        <p className="text-gray-500 mt-2">This profile may have been adopted or removed.</p>
        <Button asChild className="mt-6 bg-[#f6931d] hover:bg-orange-600">
          <Link to="/adopt">Back to adopt list</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/adopt/${pet.id}` } });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const adoption = await saveAdoption({
      user_id: user.userId,
      pet_id: pet.id,
      pet_name: pet.name,
      pet_image: pet.imageUrl,
      housing_type: String(fd.get("housing") || ""),
      reason: String(fd.get("reason") || ""),
    });
    setSubmitted({ code: adoption.application_code, id: adoption.adoption_id });
  };

  const fieldClass = "mt-1 rounded-xl border-[#2c5f51]/10";

  return (
    <>
      <PageHero title={pet.name} subtitle={`${pet.breed} · Ready for a forever home`} imageUrl={pet.imageUrl} />

      <section className="public-section bg-white">
        <div className="public-container">
          <Link
            to="/adopt"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#f6931d] hover:underline sm:mb-8"
          >
            <ArrowLeft size={16} /> Back to all pets
          </Link>

          <div className="public-split-grid">
            <div className="space-y-6">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full rounded-3xl shadow-xl object-cover max-h-[480px]"
              />
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#2c5f51]">{speciesLabel(pet.species)}</Badge>
                <Badge variant="outline">{genderLabel(pet.gender)}</Badge>
                <Badge variant="outline">
                  {pet.ageYears} year{pet.ageYears !== 1 ? "s" : ""} old
                </Badge>
                <Badge variant="outline" className="border-green-600 text-green-700">
                  Available for adoption
                </Badge>
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#2c5f51]">About {pet.name}</h2>
                <p className="text-gray-600 leading-relaxed">{pet.description}</p>
                <p className="text-sm text-gray-500">
                  <strong>Health:</strong> {pet.healthNotes}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-[#fdfaf5] rounded-2xl p-6 border">
                <h3 className="font-bold text-[#2c5f51] flex items-center gap-2 mb-4">
                  <Heart className="text-[#f6931d]" size={20} /> Adoption application
                </h3>

                {!user ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-sm text-gray-600">Sign in to submit an adoption application.</p>
                    <Button asChild className="bg-[#2c5f51] hover:bg-green-800">
                      <Link to="/login" state={{ from: `/adopt/${pet.id}` }}>
                        Sign in to apply
                      </Link>
                    </Button>
                  </div>
                ) : submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle2 className="mx-auto text-green-600" size={48} />
                    <p className="font-bold text-[#2c5f51]">Application submitted</p>
                    <p className="text-sm text-gray-500">Reference: {submitted.code}</p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link to={`/account/adoptions/${submitted.id}`}>View progress →</Link>
                    </Button>
                  </div>
                ) : !isApplying ? (
                  <div className="text-center py-4">
                    <Button 
                      onClick={() => setIsApplying(true)} 
                      className="bg-[#2c5f51] hover:bg-green-800 rounded-full px-8"
                    >
                      Apply for adoption
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Housing type</label>
                      <select name="housing" required className={`${fieldClass} flex h-10 w-full px-3 text-sm`}>
                        <option value="APARTMENT">Apartment</option>
                        <option value="HOUSE">House</option>
                        <option value="DORMITORY">Dormitory</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current pets at home</label>
                      <Input name="currentPets" placeholder="None, or describe..." className={fieldClass} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Daily work schedule</label>
                      <Input name="schedule" placeholder="e.g. Office 9–5, home most evenings" className={fieldClass} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Why adopt {pet.name}?</label>
                      <Textarea
                        name="reason"
                        required
                        placeholder="Experience with pets, household members, daily routine..."
                        className={fieldClass}
                      />
                    </div>
                    <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1"
                        required
                      />
                      I agree to home visits, medical care commitment, and the adoption guidelines below.
                    </label>
                    <Button
                      type="submit"
                      disabled={!agreed}
                      className="w-full bg-[#f6931d] hover:bg-orange-600 font-bold"
                    >
                      Submit application
                    </Button>
                  </form>
                )}
              </div>

              <div>
                <h3 className="font-bold text-[#2c5f51] mb-4">Before you apply</h3>
                <ul className="space-y-3">
                  {adoptionGuidelines.map((g) => (
                    <li key={g.id} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-[#f6931d] font-bold">•</span>
                      <span>
                        <strong>{g.title}:</strong> {g.content}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};