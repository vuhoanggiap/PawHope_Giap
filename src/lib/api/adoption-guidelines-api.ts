import { apiFetch } from "@/lib/api-client";
import type { AdoptionGuidelineResDto } from "@/lib/api/mappers";
import type { MockGuideline } from "@/data/mock";

export async function fetchAdoptionGuidelines(): Promise<MockGuideline[]> {
  const response = await apiFetch<any>("/adoption_guidelines");
  const list: AdoptionGuidelineResDto[] = Array.isArray(response) ? response : [];

  return list
    .map((g) => ({
      id: g.guideId,
      title: g.title,
      content: g.content,
      imageUrl: g.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
      priority: g.priority ?? 0,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export async function fetchGuidelineById(id: number): Promise<MockGuideline> {
  const response = await apiFetch<any>(`/adoption_guidelines/${id}`);
  const g: AdoptionGuidelineResDto = response;
  
  return {
    id: g.guideId,
    title: g.title,
    content: g.content,
    imageUrl: g.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
    priority: g.priority ?? 0,
  };
}