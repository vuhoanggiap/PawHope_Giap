import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { mockStories, storyTagLabel } from "@/data/mock";
import { Calendar } from "lucide-react";
import { fetchAdoptionGuidelines, fetchGuidelineById } from "@/lib/api/adoption-guidelines-api"; 
import type { MockGuideline } from "@/data/mock";

export const BlogPage = () => {
  const [guidelines, setGuidelines] = useState<MockGuideline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAdoptionGuidelines()
      .then((data: any) => {
        if (data && Array.isArray(data)) {
          setGuidelines(data);
        } else {
          setGuidelines([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load guidelines:", err);
        setGuidelines([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        title="Learn & stories"
        subtitle="Gentle guides for pet parents, plus heartwarming updates from our rescue community."
        imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1600"
      />

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
                  <Link to={`/blog/story-${story.slug}`} className="block h-full">
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
              <h2 className="soft-heading-lg text-2xl">Adoption Guidelines</h2>
            </div>

            {loading ? (
              <div className="text-center py-8 soft-subtext">Loading guidelines from server...</div>
            ) : guidelines.length === 0 ? (
              <div className="text-center py-8 soft-subtext">No guidelines available.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {guidelines.map((guide) => (
                  <Card key={guide.id} className="border-0 shadow-none bg-transparent p-0 soft-card-hover">
                    <Link to={`/blog/guide-${guide.id}`} className="block h-full">
                      <div className="soft-card overflow-hidden p-0 flex flex-col sm:flex-row h-full min-h-[180px]">

                        <div className="sm:w-44 h-44 sm:h-auto shrink-0 soft-image-wrap rounded-b-none sm:rounded-r-none sm:rounded-l-[1.75rem]">
                          <img
                            src={guide.imageUrl}
                            alt={guide.title}
                            className="w-full h-full object-cover min-h-[11rem] sm:min-h-full"
                          />
                        </div>

                        <CardContent className="p-5 flex flex-col justify-start flex-1 space-y-2">
                          <span className="inline-block text-xs font-medium text-[#3d6b5c] bg-[#e6f2ec] px-3 py-1 rounded-full w-fit">
                            Adoption Tips
                          </span>
                          <h3 className="font-semibold text-[#3d6b5c] hover:text-[#c97a12] transition-colors leading-snug line-clamp-2 text-base">
                            {guide.title}
                          </h3>
                          <p className="text-sm soft-subtext line-clamp-3 leading-relaxed">
                            {guide.content}
                          </p>
                        </CardContent>

                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export const BlogPostPage = () => {
  const { slug = "" } = useParams();
  const [guidePost, setGuidePost] = useState<MockGuideline | null>(null);
  const [loading, setLoading] = useState<boolean>(slug.startsWith("guide-"));
  const isGuide = slug.startsWith("guide-");
  const actualIdOrSlug = isGuide ? slug.replace("guide-", "") : slug.replace("story-", "");
  const story = !isGuide ? mockStories.find((s) => s.slug === actualIdOrSlug) : null;

  useEffect(() => {
    if (isGuide) {
      setLoading(true);
      fetchGuidelineById(Number(actualIdOrSlug))
        .then((data) => setGuidePost(data))
        .catch((err) => console.error("Error fetching guideline details:", err))
        .finally(() => setLoading(false));
    }
  }, [slug, isGuide, actualIdOrSlug]);

  if (loading) {
    return (
      <div className="text-center py-24 soft-section-cream min-h-[50vh]">
        <p className="soft-subtext">Loading content from server...</p>
      </div>
    );
  }

  if (!story && !guidePost) {
    return (
      <div className="public-container-narrow soft-section-cream min-h-[50vh] py-16 text-center sm:py-24">
        <h1 className="soft-heading-lg">Article not found</h1>
        <Link to="/blog" className="text-[#c97a12] font-medium mt-4 inline-block hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  const postTitle = isGuide ? guidePost?.title : story?.title;
  const postContent = isGuide ? guidePost?.content : story?.body;
  const postImage = isGuide ? guidePost?.imageUrl : story?.imageUrl;

  return (
    <>
      <PageHero title={postTitle || ""} imageUrl={postImage || ""} />
      <article className="public-section soft-section-warm">
        <div className="public-container-narrow">
          <div className="soft-card p-5 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#a8b8ae] mb-8 pb-6 border-b border-[#2c5f51]/8">
              {!isGuide && story ? (
                <>
                  <span className="text-xs font-medium text-[#c97a12] bg-[#fef0df] px-3 py-1 rounded-full">
                    {storyTagLabel[story.tag]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {story.date}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-[#3d6b5c] bg-[#e6f2ec] px-3 py-1 rounded-full">
                  Adoption Guideline
                </span>
              )}
            </div>

            <div className="text-[#4a5f55] text-base md:text-lg leading-[1.85] whitespace-pre-line">
              {postContent}
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