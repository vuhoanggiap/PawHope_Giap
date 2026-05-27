import { useOrganization } from "@/hooks/useOrganization";

export const AboutSection = () => {
  const org = useOrganization();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#2c5f51]">About {org.name}</h2>
          <p className="text-gray-600 leading-relaxed">{org.mission}</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-[#fdfaf5] rounded-xl">
              <p className="text-3xl font-bold text-[#f6931d]">
                {org.stats.rescues.toLocaleString()}+
              </p>
              <p className="text-sm text-gray-500 mt-1">Animals rescued</p>
            </div>
            <div className="text-center p-4 bg-[#fdfaf5] rounded-xl">
              <p className="text-3xl font-bold text-[#2c5f51]">
                {org.stats.adoptions.toLocaleString()}+
              </p>
              <p className="text-sm text-gray-500 mt-1">Happy adoptions</p>
            </div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87a?w=800"
          alt="Volunteers caring for pets"
          className="rounded-2xl shadow-xl w-full h-80 object-cover"
        />
      </div>
    </section>
  );
};
