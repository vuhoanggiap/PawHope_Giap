import { apiFetch } from "@/lib/api-client";
import { mapDonationCampaignRes, type DonationCampaignResDto } from "@/lib/api/mappers";
import type { DonationCampaign } from "@/data/public-mock";
import { sumCampaignRaised } from "@/lib/api/donations-api";

export async function fetchDonationCampaigns(): Promise<DonationCampaign[]> {
  const list = await apiFetch<DonationCampaignResDto[]>("/donation_campaigns");
  const enriched = await Promise.all(
    list.map(async (c) => {
      const raised = await sumCampaignRaised(c.campaignId).catch(() => 0);
      return mapDonationCampaignRes(c, raised);
    })
  );
  return enriched;
}

export async function fetchActiveCampaigns(): Promise<DonationCampaign[]> {
  const list = await apiFetch<DonationCampaignResDto[]>("/donation_campaigns/status/ACTIVE");
  const enriched = await Promise.all(
    list.map(async (c) => {
      const raised = await sumCampaignRaised(c.campaignId).catch(() => 0);
      return mapDonationCampaignRes(c, raised);
    })
  );
  return enriched;
}
