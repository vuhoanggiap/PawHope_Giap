import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { organization } from "@/data/mock";

export const Hero = () => (
  <section className="relative h-[600px] flex items-center justify-center text-white">
    <img
      src="https://images.unsplash.com/photo-1450778869180-41d0601e046e"
      alt="Happy dog and owner outdoors"
      className="absolute inset-0 w-full h-full object-cover brightness-50"
    />
    <div className="relative z-10 text-center space-y-6 px-4">
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter max-w-4xl mx-auto">
        Together, so no pet is left behind
      </h1>
      <p className="text-xl max-w-2xl mx-auto opacity-90">
        Over {organization.stats.inCare.toLocaleString()} dogs and cats are in our care. Our mission
        is to give every small soul a second chance at a forever home.
      </p>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Button
          asChild
          size="lg"
          className="bg-[#f6931d] hover:bg-orange-600 rounded-full px-8 font-bold"
        >
          <Link to="/adopt">Adopt now</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-[#6f4fba] hover:bg-[#5b3da1] text-white border-none rounded-full px-8 font-bold shadow-lg transition-all"
        >
          <Link to="/contact#donate">Donate</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-bold">
          <Link to="/volunteer/apply">Become a volunteer</Link>
        </Button>
      </div>
    </div>
  </section>
);
