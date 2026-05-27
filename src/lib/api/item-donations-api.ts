import { apiFetch } from "@/lib/api-client";
import { mapItemDonationRes, type ItemDonationResDto } from "@/lib/api/mappers";
import type { PublicItemDonation } from "@/data/public-mock";

export type CreateItemDonationBody = {
  userId?: number;
  donorNameManual: string;
  itemName: string;
  category: string;
  quantity: string;
  note?: string;
  status?: string;
};

export async function fetchItemDonationsByUser(userId: number): Promise<PublicItemDonation[]> {
  const list = await apiFetch<ItemDonationResDto[]>(`/item_donations/user/${userId}`);
  return list.map(mapItemDonationRes);
}

export async function createItemDonation(body: CreateItemDonationBody): Promise<PublicItemDonation> {
  const dto = await apiFetch<ItemDonationResDto>("/item_donations", {
    method: "POST",
    body: JSON.stringify({
      userId: body.userId,
      donorNameManual: body.donorNameManual,
      itemName: body.itemName,
      category: body.category,
      quantity: body.quantity,
      note: body.note,
      status: body.status ?? "PENDING",
    }),
  });
  return mapItemDonationRes(dto);
}

export async function fetchAllItemDonations(): Promise<PublicItemDonation[]> {
  const list = await apiFetch<ItemDonationResDto[]>("/item_donations");
  return list.map(mapItemDonationRes);
}
