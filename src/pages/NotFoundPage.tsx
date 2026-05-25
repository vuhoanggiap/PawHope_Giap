import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const NotFoundPage = () => (
  <div className="public-container py-24 text-center sm:py-32">
    <p className="text-8xl font-black text-[#2c5f51]/20">404</p>
    <h1 className="text-3xl font-bold text-[#2c5f51] mt-4">Page not found</h1>
    <p className="text-gray-500 mt-2 max-w-md mx-auto">
      The page you are looking for does not exist or may have moved.
    </p>
    <Button asChild className="mt-8 bg-[#f6931d] hover:bg-orange-600 font-bold">
      <Link to="/">Back to home</Link>
    </Button>
  </div>
);
