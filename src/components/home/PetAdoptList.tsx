import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { genderLabel, mockPets, speciesLabel } from "@/data/mock";

export const PetAdoptList = () => {
  const featured = mockPets.slice(0, 4);

  return (
    <section className="py-20 bg-[#fdfaf5]">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-[#2c5f51]">Pets waiting for a home</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {["All", "Dogs", "Cats", "Under 1 year"].map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-default hover:bg-[#f6931d] hover:text-white px-4 py-1"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((pet) => (
            <Card key={pet.id} className="overflow-hidden group hover:shadow-xl transition-all">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="h-56 w-full object-cover group-hover:scale-105 transition-transform"
              />
              <CardContent className="p-4 space-y-2">
                <h3 className="text-xl font-bold">
                  {pet.name} · {pet.ageYears} yr{pet.ageYears !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-[#f6931d] font-semibold uppercase">
                  {speciesLabel(pet.species)} · {genderLabel(pet.gender)}
                </p>
                <p className="text-sm text-gray-500 italic line-clamp-2">{pet.description}</p>
                <Button asChild className="w-full bg-[#2c5f51] hover:bg-green-800">
                  <Link to={`/adopt/${pet.id}`}>View profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="rounded-full px-8 font-bold border-[#2c5f51] text-[#2c5f51]">
            <Link to="/adopt">See all adoptable pets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
