import { apiFetch } from "@/lib/api-client";
import { mapDonationRes, type DonationResDto } from "@/lib/api/mappers";
import type { PublicMoneyDonation } from "@/data/public-mock";
export type CreateDonationBody = {
  campaignId: number;
  userId?: number;
  donorNameManual: string;
  amount: number;
  donationType: string;
  paymentStatus?: string;
};

export async function fetchDonationsByUser(userId: number): Promise<PublicMoneyDonation[]> {
  const list = await apiFetch<DonationResDto[]>(`/donations/user/${userId}`);
  return list.map((d) => mapDonationRes(d));
}

export async function fetchDonationsByCampaign(campaignId: number): Promise<PublicMoneyDonation[]> {
  const list = await apiFetch<DonationResDto[]>(`/donations/campaign/${campaignId}`);
  return list.map((d) => mapDonationRes(d));
}

export async function sumCampaignRaised(campaignId: number): Promise<number> {
  const list = await fetchDonationsByCampaign(campaignId);
  return list.reduce((s, d) => s + d.amount, 0);
}

export async function createDonation(body: CreateDonationBody): Promise<PublicMoneyDonation> {
  const dto = await apiFetch<DonationResDto>("/donations", {
    method: "POST",
    body: JSON.stringify({
      campaignId: body.campaignId,
      userId: body.userId,
      donorNameManual: body.donorNameManual,
      amount: body.amount,
      donationType: body.donationType,
      paymentStatus: body.paymentStatus ?? "PENDING",
    }),
  });
  return mapDonationRes(dto);
}

export async function fetchAllDonations(): Promise<PublicMoneyDonation[]> {
  const list = await apiFetch<DonationResDto[]>("/donations");
  return list.map((d) => mapDonationRes(d));
}
