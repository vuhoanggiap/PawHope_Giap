import { Link } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";

export const Footer = () => {
  const org = useOrganization();

  return (
    <footer className="bg-[#1a1a1a] pb-8 pt-12 text-gray-300 sm:pt-16">
      <div className="public-container">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-12 lg:mb-12">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-lg font-bold text-white">{org.name.toUpperCase()}</h4>
            <p className="text-sm leading-relaxed opacity-80">{org.mission}</p>
            <div className="flex gap-4 pt-2">
              <div className="h-8 w-8 cursor-pointer rounded-full bg-white/10 transition-colors hover:bg-[#ecdd14fa]" />
              <div className="h-8 w-8 cursor-pointer rounded-full bg-white/10 transition-colors hover:bg-[#f6931d]" />
              <div className="h-8 w-8 cursor-pointer rounded-full bg-white/10 transition-colors hover:bg-[#f6931d]" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="transition-colors hover:text-white">
                  Adoption process
                </Link>
              </li>
              <li>
                <Link to="/volunteer/apply" className="transition-colors hover:text-white">
                  Volunteer with us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-white">
                  Rescue stories & blog
                </Link>
              </li>
              <li>
                <Link to="/rescue" className="transition-colors hover:text-white">
                  Report an animal in need
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="transition-colors hover:text-white">
                  Pet care guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  FAQ & support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Contact</h4>
            <p className="text-sm italic">{org.address}</p>
            <p className="text-sm font-bold text-[#f6931d]">{org.hotline}</p>
            <p className="text-sm">{org.email}</p>
          </div>
        </div>

        <p className="text-center text-xs opacity-60">© {new Date().getFullYear()} {org.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};
