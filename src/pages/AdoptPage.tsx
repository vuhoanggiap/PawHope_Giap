import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adoptionGuidelines, genderLabel, speciesLabel, type PetSpecies } from "@/data/mock";
import { useAdoptablePets } from "@/hooks/usePets";
import { PawPrint, Search } from "lucide-react";

type SpeciesFilter = "ALL" | PetSpecies;
type AgeFilter = "ALL" | "UNDER_1" | "ADULT";

export const AdoptPage = () => {
  const { pets, loading, error } = useAdoptablePets();
  const [species, setSpecies] = useState<SpeciesFilter>("ALL");
  const [age, setAge] = useState<AgeFilter>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return pets.filter((pet) => {
      if (species !== "ALL" && pet.species !== species) return false;
      if (age === "UNDER_1" && pet.ageYears >= 1) return false;
      if (age === "ADULT" && pet.ageYears < 1) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          pet.name.toLowerCase().includes(q) ||
          pet.breed.toLowerCase().includes(q) ||
          pet.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pets, species, age, query]);

  return (
    <>
      <PageHero
        title="Adopt a pet"
        subtitle="Every adoption opens a kennel for the next animal in need — take your time finding the right match."
        imageUrl="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1600"
      />

      <section className="public-section soft-section-cream">
        <div className="public-container">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <aside className="lg:w-72 space-y-5 shrink-0">
              <div className="soft-card p-5 space-y-4">
                <h3 className="font-medium text-[#3d6b5c]">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8b8ae]" size={18} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name or breed..."
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-[#2c5f51]/10 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#f6931d]/20 transition-shadow"
                  />
                </div>
              </div>

              <div className="soft-card p-5 space-y-2">
                <h3 className="font-medium text-[#3d6b5c] mb-2">Species</h3>
                {(
                  [
                    ["ALL", "All"],
                    ["DOG", "Dogs"],
                    ["CAT", "Cats"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSpecies(value)}
                    className={
                      species === value ? "soft-pill-active-green block w-full text-left" : "soft-pill-inactive block w-full text-left"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="soft-card p-5 space-y-2">
                <h3 className="font-medium text-[#3d6b5c] mb-2">Age</h3>
                {(
                  [
                    ["ALL", "Any age"],
                    ["UNDER_1", "Under 1 year"],
                    ["ADULT", "1 year and older"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAge(value)}
                    className={
                      age === value ? "soft-pill-active-orange block w-full text-left" : "soft-pill-inactive block w-full text-left"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="soft-subtext">
                  {loading
                    ? "Loading pets…"
                    : error
                      ? `API unavailable — showing fallback. (${error})`
                      : null}{" "}
                  Showing <span className="font-medium text-[#3d6b5c]">{filtered.length}</span> adoptable
                  pet{filtered.length !== 1 ? "s" : ""}
                </p>
                {/* <span className="text-xs font-medium text-[#a8b8ae] bg-white/70 px-3 py-1.5 rounded-full ring-1 ring-[#2c5f51]/8">
                  UI preview — API coming soon
                </span> */}
              </div>

              {filtered.length === 0 ? (
                <div className="soft-card p-12 text-center soft-subtext">
                  No pets match your filters. Try adjusting search or filters.
                </div>
              ) : (
                <div className="public-card-grid xl:grid-cols-3">
                  {filtered.map((pet) => (
                    <Card key={pet.id} className="border-0 shadow-none bg-transparent p-0 soft-card-hover">
                      <div className="soft-card overflow-hidden p-0 h-full flex flex-col">
                        <div className="soft-image-wrap rounded-b-none rounded-t-[1.75rem]">
                          <img src={pet.imageUrl} alt={pet.name} className="h-52 w-full object-cover" />
                        </div>
                        <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                          <div>
                            <h3 className="text-lg font-medium text-[#3d6b5c]">{pet.name}</h3>
                            <p className="text-sm soft-subtext mt-0.5">
                              {pet.breed} · {pet.ageYears} yr{pet.ageYears !== 1 ? "s" : ""} ·{" "}
                              {genderLabel(pet.gender)}
                            </p>
                          </div>
                          <span className="inline-block self-start text-xs font-medium text-[#c97a12] bg-[#fef0df] px-3 py-1 rounded-full">
                            {speciesLabel(pet.species)}
                          </span>
                          <p className="text-sm soft-subtext line-clamp-2 flex-1">{pet.description}</p>
                          <Button
                            asChild
                            className="w-full rounded-full h-10 bg-[#3d6b5c]/90 hover:bg-[#3d6b5c] font-medium"
                          >
                            <Link to={`/adopt/${pet.id}`}>View profile</Link>
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section bg-white">
        <div className="public-container">
          <div className="text-center mb-10 space-y-2">
            <p className="soft-label">Before you apply</p>
            <h2 className="soft-heading-lg">Adoption guidelines</h2>
          </div>
          <div className="public-form-grid md:grid-cols-2">
            {adoptionGuidelines.map((g) => (
              <div key={g.id} className="soft-stat flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-[#fef0df] flex items-center justify-center shrink-0">
                  <PawPrint size={18} className="text-[#c97a12]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#3d6b5c]">{g.title}</h4>
                  <p className="text-sm soft-subtext mt-1 leading-relaxed">{g.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
