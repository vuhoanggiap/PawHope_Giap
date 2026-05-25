import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { mockStories, storyTagLabel } from "@/data/mock";

export const RescueStories = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#2c5f51] uppercase tracking-tighter">
              Rescue journal & community
            </h2>
            <p className="text-gray-500 italic">Small stories that build big hope</p>
          </div>
          <Button
            asChild
            variant="link"
            className="text-[#f6931d] font-bold p-0 hover:no-underline flex items-center gap-2"
          >
            <Link to="/blog">
              View all articles <BookOpen size={18} />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockStories.map((story) => (
            <Card
              key={story.id}
              className="border border-gray-100 shadow-sm group overflow-hidden rounded-2xl"
            >
              <Link to={`/blog/${story.slug}`} className="block">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#f6931d] text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                      {storyTagLabel[story.tag]}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center text-gray-400 text-xs gap-2">
                    <Calendar size={14} />
                    <span>{story.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#2c5f51] group-hover:text-[#f6931d] transition-colors line-clamp-2 leading-tight">
                    {story.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{story.summary}</p>

                  <div className="pt-2">
                    <span className="text-[#f6931d] font-bold text-sm border-b-2 border-[#f6931d] pb-0.5">
                      Read more
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
