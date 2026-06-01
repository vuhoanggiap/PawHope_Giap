import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { genderLabel, speciesLabel } from "@/data/mock";
import { apiFetch } from "@/lib/api-client"; // Import apiFetch của bạn

export const PetAdoptList = () => {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải danh sách thú cưng từ DB
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const data = await apiFetch("/pets"); 
        
        // --- CHỈ LỌC NHỮNG BÉ CÓ STATUS LÀ AVAILABLE_FOR_ADOPTION ---
        const availablePets = Array.isArray(data) 
          ? data.filter((pet: any) => pet.status === "AVAILABLE_FOR_ADOPTION") 
          : [];
        
        // Lấy 4 bé đầu tiên từ danh sách đã lọc
        setPets(availablePets.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch pets:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchPets();
  }, []);

  if (loading) {
    return <section className="py-20 bg-[#fdfaf5] text-center">Loading pets...</section>;
  }

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
          {pets.map((pet: any) => (
            // Thêm flex flex-col h-full vào đây
            <Card key={pet.petId || pet.id} className="overflow-hidden group hover:shadow-xl transition-all flex flex-col h-full">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="h-56 w-full object-cover group-hover:scale-105 transition-transform"
              />
              {/* Thêm flex flex-col flex-grow vào đây để nội dung chiếm hết không gian còn lại */}
              <CardContent className="p-4 space-y-2 flex flex-col flex-grow">
                <h3 className="text-xl font-bold">
                  {pet.name} · {pet.ageMonths ? Math.floor(pet.ageMonths / 12) : 0} yr{pet.ageMonths && Math.floor(pet.ageMonths / 12) !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-[#f6931d] font-semibold uppercase">
                  {speciesLabel(pet.species)} · {genderLabel(pet.gender)}
                </p>
                {/* Phần này sẽ tự động giãn (flex-grow) để đẩy nút xuống dưới cùng */}
                <p className="text-sm text-gray-500 italic line-clamp-2 flex-grow">{pet.description}</p>
                
                {/* Phần nút bấm luôn nằm cố định ở đáy card */}
                <div className="pt-2">
                  <Button asChild className="w-full bg-[#2c5f51] hover:bg-green-800">
                    <Link to={`/adopt/${pet.petId || pet.id}`}>View profile</Link>
                  </Button>
                </div>
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