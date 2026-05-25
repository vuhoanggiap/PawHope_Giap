interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export const PageHero = ({
  title,
  subtitle,
  imageUrl = "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600",
}: PageHeroProps) => (
  <section className="relative flex h-[220px] items-end overflow-hidden sm:h-[280px] md:h-[320px] lg:h-[360px]">
    <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#2c5f51]/85 via-[#2c5f51]/45 to-[#fef6ee]/30" />
    <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#f6931d]/10 blur-3xl sm:h-64 sm:w-64" />
    <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl sm:h-48 sm:w-48" />

    <div className="public-container relative z-10 pb-8 text-white sm:pb-10 md:pb-14">
      <p className="soft-label mb-2 text-white/70 sm:mb-3">PawsHopeNet</p>
      <h1 className="max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl md:text-[2.75rem]">{title}</h1>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-white/85 sm:mt-4 sm:text-base md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  </section>
);
