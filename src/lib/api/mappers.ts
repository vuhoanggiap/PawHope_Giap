import type { MockPet } from "@/data/mock";
import type {
  DonationCampaign,
  PublicAdoption,
  PublicItemDonation,
  PublicMoneyDonation,
  PublicNotification,
  PublicOrder,
  PublicOrderItem,
  PublicRescueReport,
  RescueStatus,
} from "@/data/public-mock";
import { formatApiDate, formatApiDateTime, toNumber } from "@/lib/api/format";
import type { ProductResDto } from "@/lib/api/product-mapper";
import { mapProductRes } from "@/lib/api/product-mapper";

function formatApiDateTimeKeepLocal(value?: string) {
  if (!value) return "";

  return value
    .replace("T", " ")
    .replace(/\.\d{3}.*/, "")
    .slice(0, 16);
}

export type PetResDto = {
  petId: number;
  petCode?: string;
  name: string;
  gender: string;
  species: string;
  breed: string;
  ageMonths?: number;
  weightKg?: number;
  healthStatus?: string;
  personality?: string;
  status: string;
  imageUrl?: string;
  description?: string;
  kennelId?: number;
  fromReportId?: number;
  intakeDate?: string;
};

export type RescueReportResDto = {
  reportId?: number;
  assignedTo?: number;
  userId?: number;
  reporterName: string;
  reporterPhone: string;
  locationText: string;
  urgencyLevel: string;
  injuryType: string;
  temperament: string;
  behavior: string;
  additionalNote?: string;
  imageUrl?: string;
  status: string;
  trackingCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdoptionResDto = {
  adoptionId: number;
  applicationCode: string;
  petId: number;
  userId: number;
  housingType?: string;
  applicantAddress?: string;
  hasPetExperience?: boolean;
  currentPets?: string;
  workingSchedule?: string;
  reason?: string;
  familyAgreement?: boolean;
  financialCommitment?: boolean;
  status: string;
  applyDate?: string;
  priorityLevel?: string;
  reviewStatus?: string;
  missingInfoNote?: string;
  adoptionFee?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  notes?: string;
  processedBy?: number;
  reviewedAt?: string;
};

export type DonationCampaignResDto = {
  campaignId: number;
  title: string;
  description: string;
  targetAmount: number;
  startDate?: string;
  endDate?: string;
  status: string;
};

export type DonationResDto = {
  donationId: number;
  campaignId: number;
  userId?: number;
  donorNameManual?: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus: string;
  donationType?: string;
  receivedAt?: string;
};

export type ItemDonationResDto = {
  itemDonationId: number;
  userId?: number;
  donorNameManual?: string;
  itemName: string;
  category?: string;
  quantity?: string;
  status?: string;
  receivedBy?: number;
  note?: string;
  receivedAt?: string;
};

export type CartResDto = {
  cartId: number;
  userId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
};

export type OrderItemResDto = {
  productId: number;
  productNameSnapshot: string;
  quantity: number;
  priceAtPurchase: number;
};

export type OrderResDto = {
  orderId: number;
  userId: number;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItemResDto[];
};

export type NotificationResDto = {
  notiId: number;
  userId: number;
  message: string;
  type: string;
  relatedId?: number;
  isRead: boolean;
  createdAt?: string;
};

export type UserResDto = {
  userId: number;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  status?: boolean;
};

export type AdoptionGuidelineResDto = {
  guideId: number;
  title: string;
  content: string;
  priority?: number;
};

export type OrganizationResDto = {
  orgName?: string;
  logoUrl?: string;
  hotline?: string;
  email?: string;
  facebookLink?: string;
  address?: string;
  missionStatement?: string;
};

export function mapPetRes(dto: PetResDto): MockPet {
  const months = dto.ageMonths ?? 12;
  return {
    id: dto.petId,
    name: dto.name,
    species: dto.species as MockPet["species"],
    breed: dto.breed ?? "",
    ageYears: Math.max(0, Math.round((months / 12) * 10) / 10),
    gender: dto.gender as MockPet["gender"],
    description: dto.description ?? dto.personality ?? "",
    healthNotes: dto.healthStatus ?? "",
    imageUrl: dto.imageUrl ?? "",
    status: "AVAILABLE_FOR_ADOPTION",
  };
}

export function notificationLink(type: string, relatedId?: number): string | undefined {
  if (relatedId == null) return undefined;
  switch (type) {
    case "RESCUE_ASSIGNED":
      return "/admin/rescue";
    case "ADOPTION_MEETING":
    case "ADOPTION_HANDOVER":
    case "ADOPTION_FOLLOWUP":
      return `/account/adoptions/${relatedId}`;
    case "ORDER_STATUS":
      return `/account/orders/${relatedId}`;
    case "DONATION":
      return "/account/donations";
    case "VOLUNTEER_RESULT":
    case "VOLUNTEER_INTERVIEW":
      return "/volunteer/apply";
    default:
      return undefined;
  }
}

export function mapRescueReportRes(dto: RescueReportResDto): PublicRescueReport {
  return {
    tracking_code: dto.trackingCode,
    user_id: dto.userId,
    reporter_name: dto.reporterName,
    reporter_phone: dto.reporterPhone,
    location_text: dto.locationText,
    urgency_level: dto.urgencyLevel,
    injury_type: dto.injuryType,
    temperament: dto.temperament,
    behavior: dto.behavior,
    additional_note: dto.additionalNote,
    image_url: dto.imageUrl,
    status: dto.status as RescueStatus,
    created_at: formatApiDateTime(dto.createdAt),
    updated_at: formatApiDateTime(dto.updatedAt),
  };
}

export function mapAdoptionRes(
  dto: AdoptionResDto,
  pet?: { name: string; imageUrl: string }
): PublicAdoption {
  return {
    adoption_id: dto.adoptionId,
    application_code: dto.applicationCode,
    user_id: dto.userId,
    pet_id: dto.petId,
    pet_name: pet?.name ?? `Pet #${dto.petId}`,
    pet_image: pet?.imageUrl ?? "",
    status: dto.status as PublicAdoption["status"],
    apply_date: formatApiDate(dto.applyDate),
    housing_type: dto.housingType,
    reason: dto.reason,
  };
}

export function mapDonationCampaignRes(
  dto: DonationCampaignResDto,
  raised = 0
): DonationCampaign {
  return {
    campaign_id: dto.campaignId,
    title: dto.title,
    description: dto.description ?? "",
    target_amount: toNumber(dto.targetAmount),
    raised_amount: raised,
    start_date: formatApiDate(dto.startDate),
    end_date: formatApiDate(dto.endDate),
    status: dto.status,
  };
}

export function mapDonationRes(dto: DonationResDto, campaignTitle = ""): PublicMoneyDonation {
  return {
    donation_id: dto.donationId,
    user_id: dto.userId,
    campaign_id: dto.campaignId,
    campaign_title: campaignTitle,
    donor_name: dto.donorNameManual ?? "Guest",
    amount: toNumber(dto.amount),
    payment_method: dto.paymentMethod ?? "PAYPAL",
    payment_status: dto.paymentStatus,
    created_at: formatApiDateTime(dto.receivedAt),
  };
}

export function mapItemDonationRes(dto: ItemDonationResDto): PublicItemDonation {
  return {
    item_donation_id: dto.itemDonationId,
    user_id: dto.userId,
    donor_name: dto.donorNameManual ?? "",
    item_name: dto.itemName,
    category: dto.category ?? "OTHER",
    quantity: dto.quantity ?? "1",
    status: dto.status ?? "PENDING",
    created_at: formatApiDateTime(dto.receivedAt),
  };
}

export function mapOrderRes(dto: OrderResDto): PublicOrder {
  const items: PublicOrderItem[] = (dto.items ?? []).map((i) => ({
    product_id: i.productId,
    product_name: i.productNameSnapshot,
    quantity: i.quantity,
    price: toNumber(i.priceAtPurchase),
  }));
  return {
    order_id: dto.orderId,
    user_id: dto.userId,
    items,
    subtotal_amount: toNumber(dto.subtotalAmount),
    shipping_fee: toNumber(dto.shippingFee),
    total_amount: toNumber(dto.totalAmount),
    payment_method: dto.paymentMethod,
    payment_status: dto.paymentStatus,
    order_status: dto.orderStatus,
    shipping_address: dto.shippingAddress,
    receiver_name: dto.receiverName,
    receiver_phone: dto.receiverPhone,
    note: dto.note,
    created_at: formatApiDateTimeKeepLocal(dto.createdAt),
  };
}

export function mapNotificationRes(dto: NotificationResDto): PublicNotification {
  return {
    noti_id: dto.notiId,
    user_id: dto.userId,
    message: dto.message,
    type: dto.type,
    is_read: dto.isRead,
    created_at: formatApiDateTime(dto.createdAt),
    link: notificationLink(dto.type, dto.relatedId),
    related_id: dto.relatedId,
  };
}

export function mapUserRes(dto: UserResDto) {
  return {
    userId: dto.userId,
    username: dto.username,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    role: "USER" as const,
  };
}

export { mapProductRes, type ProductResDto };
