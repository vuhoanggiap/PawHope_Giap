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
  const list = await apiFetch<DonationCampaignResDto[]>("/donation_campaigns/status/ONGOING");
  const enriched = await Promise.all(
    list.map(async (c) => {
      const raised = await sumCampaignRaised(c.campaignId).catch(() => 0);
      return mapDonationCampaignRes(c, raised);
    })
  );
  return enriched;
}

export async function updateCampaignStatus(
  id: number,
  status: string
): Promise<DonationCampaign> {
  const dto = await apiFetch<DonationCampaignResDto>(
    `/donation_campaigns/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  const raised = await sumCampaignRaised(dto.campaignId).catch(() => 0);

  return mapDonationCampaignRes(dto, raised);
}

export async function updateCampaign(
  id: number,
  body: {
    title: string;
    description: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
    status: string;
  }
): Promise<DonationCampaign> {
  const dto = await apiFetch<DonationCampaignResDto>(
    `/donation_campaigns/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );

  const raised = await sumCampaignRaised(dto.campaignId).catch(() => 0);

  return mapDonationCampaignRes(dto, raised);
}

export async function deleteCampaign(id: number) {
  return apiFetch(`/donation_campaigns/${id}`, {
    method: "DELETE",
  });
}

export async function createCampaign(body: {
  title: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  status?: string;
}) {
  const dto = await apiFetch<DonationCampaignResDto>(
    "/donation_campaigns",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return mapDonationCampaignRes(dto);
}
