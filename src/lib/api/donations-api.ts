import { apiFetch } from "@/lib/api-client";
import { mapDonationRes, type DonationResDto } from "@/lib/api/mappers";
import type { PublicMoneyDonation, DonationCampaign } from "@/data/public-mock";

export type CreateDonationBody = {
  campaignId: number;
  userId?: number;
  donorNameManual: string;
  amount: number;
  donationType: string;
  paymentStatus?: string;
};

export async function fetchPublicCampaigns(): Promise<DonationCampaign[]> {
  const response = await apiFetch<any>("/donation_campaigns");
  const list = response || [];
  return list.map((c: any) => ({
    campaign_id: c.campaignId,
    title: c.title,
    description: c.description ?? "",
    target_amount: Number(c.targetAmount || 0),
    raised_amount: Number(c.raisedAmount || 0), 
    start_date: c.startDate,
    end_date: c.endDate,
    status: c.status,
  }));
}

export async function createItemDonation(data: {
  userId?: number;
  donorNameManual?: string;
  itemName: string;
  category: string;
  quantity: string;
  note?: string;
}): Promise<any> {
  return await apiFetch("/item_donations", {
    method: "POST",
    body: JSON.stringify({
      userId: data.userId || null,
      donorNameManual: data.donorNameManual,
      itemName: data.itemName,
      category: data.category,
      quantity: data.quantity,
      note: data.note,
    }),
  });
}

export async function fetchDonationsByUser(userId: number): Promise<PublicMoneyDonation[]> {
  const response = await apiFetch<any>(`/donations/user/${userId}`);
  const list: DonationResDto[] = Array.isArray(response) ? response : [];
  return list.map((d) => mapDonationRes(d));
}

export async function fetchDonationsByCampaign(campaignId: number): Promise<PublicMoneyDonation[]> {
  const response = await apiFetch<any>(`/donations/campaign/${campaignId}`);
  const list: DonationResDto[] = Array.isArray(response) ? response : [];
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
  const response = await apiFetch<any>("/donations");
  const list: DonationResDto[] = Array.isArray(response) ? response : [];
  return list.map((d) => mapDonationRes(d));
}
