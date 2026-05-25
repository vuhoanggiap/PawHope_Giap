import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { mockArticles, mockStories, storyTagLabel } from "@/data/mock";
import { Calendar, Clock } from "lucide-react";

const categories = ["All", "Dog Care", "Cat Care", "Adoption Tips", "Health"] as const;

export const BlogPage = () => {
  const [params] = useSearchParams();
  const category = params.get("category") ?? "All";

  const articles =
    category === "All"
      ? mockArticles
      : mockArticles.filter((a) => a.category === category);

  return (
    <>
      <PageHero
        title="Learn & stories"
        subtitle="Gentle guides for pet parents, plus heartwarming updates from our rescue community."
        imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1600"
      />

      <section className="border-b border-[#2c5f51]/5 bg-white py-6 sm:py-8 md:py-10">
        <div className="public-container">
          <div className="public-tab-scroll justify-center md:justify-start">
            {categories.map((cat) => (
              <Link key={cat} to={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}>
                <span
                  className={
                    category === cat ? "soft-pill-active-green cursor-pointer" : "soft-pill-inactive cursor-pointer"
                  }
                >
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section soft-section-cream">
        <div className="public-container space-y-12 sm:space-y-16">
          <div>
            <div className="mb-8 space-y-1">
              <p className="soft-label">Rescue journal</p>
              <h2 className="soft-heading-lg text-2xl">Stories from the field</h2>
            </div>
            <div className="public-card-grid md:grid-cols-3">
              {mockStories.map((story) => (
                <Card key={story.id} className="border-0 shadow-none bg-transparent p-0 soft-card-hover">
                  <Link to={`/blog/${story.slug}`} className="block h-full">
                    <div className="soft-card overflow-hidden p-0 h-full">
                      <div className="soft-image-wrap rounded-b-none rounded-t-[1.75rem] h-48">
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <span className="inline-block text-xs font-medium text-[#c97a12] bg-[#fef0df] px-3 py-1 rounded-full">
                          {storyTagLabel[story.tag]}
                        </span>
                        <h3 className="font-medium text-[#3d6b5c] line-clamp-2 leading-snug group-hover:text-[#c97a12]">
                          {story.title}
                        </h3>
                        <p className="text-sm soft-subtext line-clamp-2">{story.summary}</p>
                      </CardContent>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-8 space-y-1">
              <p className="soft-label">Guides</p>
              <h2 className="soft-heading-lg text-2xl">
                {category === "All" ? "All articles" : category}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              {articles.map((article) => (
                <Card key={article.id} className="border-0 shadow-none bg-transparent p-0 soft-card-hover">
                  <div className="soft-card overflow-hidden p-0 flex flex-col sm:flex-row h-full">
                    <div className="sm:w-44 h-44 sm:h-auto shrink-0 soft-image-wrap rounded-b-none sm:rounded-r-none sm:rounded-l-[1.75rem]">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover min-h-[11rem] sm:min-h-full"
                      />
                    </div>
                    <CardContent className="p-5 flex flex-col justify-between flex-1">
                      <div className="space-y-2">
                        <span className="inline-block text-xs font-medium text-[#3d6b5c] bg-[#e6f2ec] px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                        <Link to={`/blog/${article.slug}`}>
                          <h3 className="font-medium text-[#3d6b5c] hover:text-[#c97a12] transition-colors leading-snug">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-sm soft-subtext line-clamp-2">{article.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#a8b8ae] mt-4">
                        <Clock size={14} /> {article.readMinutes} min read
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const BlogPostPage = () => {
  const { slug = "" } = useParams();
  const story = mockStories.find((s) => s.slug === slug);
  const article = mockArticles.find((a) => a.slug === slug);
  const post = story ?? article;

  if (!post) {
    return (
      <div className="public-container-narrow soft-section-cream min-h-[50vh] py-16 text-center sm:py-24">
        <h1 className="soft-heading-lg">Article not found</h1>
        <Link to="/blog" className="text-[#c97a12] font-medium mt-4 inline-block hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  const isStory = Boolean(story);
  const title = post.title;
  const imageUrl = post.imageUrl;
  const body = "body" in post ? post.body : "";

  return (
    <>
      <PageHero title={title} imageUrl={imageUrl} />
      <article className="public-section soft-section-warm">
        <div className="public-container-narrow">
          <div className="soft-card p-5 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#a8b8ae] mb-8 pb-6 border-b border-[#2c5f51]/8">
              {isStory && story ? (
                <>
                  <span className="text-xs font-medium text-[#c97a12] bg-[#fef0df] px-3 py-1 rounded-full">
                    {storyTagLabel[story.tag]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {story.date}
                  </span>
                </>
              ) : article ? (
                <>
                  <span className="text-xs font-medium text-[#3d6b5c] bg-[#e6f2ec] px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {article.readMinutes} min read
                  </span>
                </>
              ) : null}
            </div>

            <div className="text-[#4a5f55] text-base md:text-lg leading-[1.85] whitespace-pre-line">
              {body}
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 mt-10 text-[#c97a12] font-medium hover:text-[#f6931d] transition-colors"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
};
