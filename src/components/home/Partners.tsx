import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export const Partners = () => {
  const partners = [
    { name: "GoldPet", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_1.png?1776225626555" },
    { name: "SmartHeart", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_2.png?1776225626555" },
    { name: "Me-O", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_4.png?1776225626555" },
    { name: "FiveVet", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_6.png?1776225626555" },
    { name: "InterPetFest", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_7.png?1776225626555" },
    { name: "PetFood", logo: "https://bizweb.dktcdn.net/100/507/013/themes/978891/assets/brand_3.png?1776225626555" },
  ];

  return (
    <section className="py-16 bg-[#f9f9f9]">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#2c5f51] uppercase tracking-tighter">
            Our partners
          </h2>
          <div className="w-16 h-1 bg-[#f6931d] mx-auto mt-2 rounded-full" />
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
          className="pb-10"
        >
          {partners.map((partner) => (
            <SwiperSlide key={partner.name}>
              <div className="group relative w-full h-28 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md flex items-center justify-center p-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#2c5f51]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-bold text-xs tracking-widest uppercase text-center px-2">
                    {partner.name}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex justify-center gap-2 mt-4">
          <div className="w-8 h-1.5 rounded-full bg-[#f6931d]" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>
      </div>
    </section>
  );
};
