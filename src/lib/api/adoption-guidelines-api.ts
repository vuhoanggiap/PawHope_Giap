import { apiFetch } from "@/lib/api-client";
import type { AdoptionGuidelineResDto } from "@/lib/api/mappers";
import type { MockGuideline } from "@/data/mock";

export async function fetchAdoptionGuidelines(): Promise<MockGuideline[]> {
  const list = await apiFetch<AdoptionGuidelineResDto[]>("/adoption_guidelines");
  return list
    .map((g) => ({
      id: g.guideId,
      title: g.title,
      content: g.content,
      priority: g.priority ?? 0,
    }))
    .sort((a, b) => a.priority - b.priority);
}
