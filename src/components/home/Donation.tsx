import { Link } from "react-router-dom";

export const Donation = () => (
  <section className="py-20 bg-[#2c5f51] text-white">
    <div className="container mx-auto max-w-4xl px-4 text-center space-y-8">
      <h2 className="text-4xl font-bold">Your support saves lives</h2>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        <div className="bg-white/10 p-6 rounded-2xl">
          <h4 className="font-bold mb-2">Financial gifts</h4>
          <p className="text-sm opacity-80">
            Cover emergency surgery, medication, and daily sanctuary operations.
          </p>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl">
          <h4 className="font-bold mb-2">Supplies & essentials</h4>
          <p className="text-sm opacity-80">
            Donate food, litter, medicine, bedding, and cleaning supplies.
          </p>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl">
          <h4 className="font-bold mb-2">Fundraising merch</h4>
          <p className="text-sm opacity-80">Shop PawsHopeNet items — proceeds go directly to rescue.</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <Link
          to="/donate"
          className="inline-block text-[#f6931d] font-bold border-b-2 border-[#f6931d] pb-0.5 hover:text-orange-300"
        >
          Donate now →
        </Link>
        <Link
          to="/shop"
          className="inline-block text-white/90 font-bold border-b-2 border-white/40 pb-0.5 hover:text-white"
        >
          Visit shop →
        </Link>
      </div>
    </div>
  </section>
);
