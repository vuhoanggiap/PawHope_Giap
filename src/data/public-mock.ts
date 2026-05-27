export type RescueStatus = "PENDING" | "IN_PROGRESS" | "RESCUED" | "FAILED";

export type AdoptionStatus =
  | "PENDING"
  | "MEETING_SCHEDULED"
  | "INTERVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "HANDOVER_SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export interface PublicRescueReport {
  tracking_code: string;
  user_id?: number;
  reporter_name: string;
  reporter_phone: string;
  location_text: string;
  urgency_level: string;
  injury_type: string;
  temperament: string;
  behavior: string;
  additional_note?: string;
  image_url?: string;
  status: RescueStatus;
  created_at: string;
  updated_at: string;
}

export interface PublicAdoption {
  adoption_id: number;
  application_code: string;
  user_id: number;
  pet_id: number;
  pet_name: string;
  pet_image: string;
  status: AdoptionStatus;
  apply_date: string;
  housing_type?: string;
  reason?: string;
}

export interface PublicNotification {
  noti_id: number;
  user_id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  related_id?: number;
}

/** Demo codes visitors can try on /rescue/track */
export const demoRescueReports: PublicRescueReport[] = [
  {
    tracking_code: "RSC-2026-DEMO1",
    reporter_name: "Demo Reporter",
    reporter_phone: "+84 988 000 001",
    location_text: "Ba Dinh district, Hanoi",
    urgency_level: "HIGH",
    injury_type: "BLEEDING",
    temperament: "SCARED",
    behavior: "IMMOBILE",
    additional_note: "Small dog under parked car, bleeding from paw.",
    status: "IN_PROGRESS",
    created_at: "2026-05-18 09:12",
    updated_at: "2026-05-18 11:40",
  },
  {
    tracking_code: "RSC-2026-DEMO2",
    reporter_name: "Minh Tran",
    reporter_phone: "+84 901 222 333",
    location_text: "Thu Duc City, Ho Chi Minh City",
    urgency_level: "MEDIUM",
    injury_type: "NONE",
    temperament: "FRIENDLY",
    behavior: "ACTIVE",
    status: "RESCUED",
    created_at: "2026-05-10 14:00",
    updated_at: "2026-05-11 08:30",
  },
];

export const demoUserAdoptions: PublicAdoption[] = [
  {
    adoption_id: 501,
    application_code: "AD-2026-0501",
    user_id: 101,
    pet_id: 2,
    pet_name: "Mochi",
    pet_image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
    status: "MEETING_SCHEDULED",
    apply_date: "2026-05-12",
    housing_type: "APARTMENT",
    reason: "Quiet home, experienced with cats.",
  },
];

export const demoUserNotifications: PublicNotification[] = [
  {
    noti_id: 9001,
    user_id: 101,
    message: "Your adoption meeting for Mochi is scheduled for May 22, 2:00 PM.",
    type: "ADOPTION_MEETING",
    is_read: false,
    created_at: "2026-05-19 10:00",
    link: "/account/adoptions/501",
  },
  {
    noti_id: 9002,
    user_id: 101,
    message: "Thank you for supporting PawsHopeNet — your report helps us respond faster.",
    type: "SYSTEM",
    is_read: true,
    created_at: "2026-05-15 09:00",
  },
];

export const adoptionProgressSteps: { status: AdoptionStatus; label: string; description: string }[] = [
  { status: "PENDING", label: "Application submitted", description: "Our team is reviewing your form." },
  { status: "MEETING_SCHEDULED", label: "Meet & greet", description: "Home visit or sanctuary meeting scheduled." },
  { status: "INTERVIEWING", label: "Interview", description: "Staff follow-up and compatibility check." },
  { status: "APPROVED", label: "Approved", description: "Congratulations — adoption approved." },
  { status: "HANDOVER_SCHEDULED", label: "Handover", description: "Pick-up or delivery date confirmed." },
  { status: "COMPLETED", label: "Forever home", description: "Adoption completed. Follow-ups may continue." },
];

export function formatPublicEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function rescueStatusIndex(status: RescueStatus) {
  const order: RescueStatus[] = ["PENDING", "IN_PROGRESS", "RESCUED"];
  if (status === "FAILED") return -1;
  return order.indexOf(status);
}

export function adoptionStatusIndex(status: AdoptionStatus) {
  const order = adoptionProgressSteps.map((s) => s.status);
  if (status === "REJECTED" || status === "CANCELLED") return -1;
  return order.indexOf(status);
}

export interface PublicProduct {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
}

export interface PublicCartLine {
  product_id: number;
  quantity: number;
  /** Set when loaded from Spring Boot cart API */
  cart_id?: number;
}

export interface PublicOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface PublicOrder {
  order_id: number;
  user_id: number;
  items: PublicOrderItem[];
  subtotal_amount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string;
  receiver_name: string;
  receiver_phone: string;
  note?: string;
  created_at: string;
}

export interface DonationCampaign {
  campaign_id: number;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface PublicMoneyDonation {
  donation_id: number;
  user_id?: number;
  campaign_id: number;
  campaign_title: string;
  donor_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export interface PublicItemDonation {
  item_donation_id: number;
  user_id?: number;
  donor_name: string;
  item_name: string;
  category: string;
  quantity: string;
  status: string;
  created_at: string;
}

export const mockProducts: PublicProduct[] = [
  {
    product_id: 1,
    product_name: "PawsHopeNet T-shirt",
    description: "Soft cotton tee — proceeds fund medical care.",
    price: 150_000,
    stock_quantity: 48,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    is_active: true,
  },
  {
    product_id: 2,
    product_name: "Rescue tote bag",
    description: "Reusable canvas bag with paw print logo.",
    price: 120_000,
    stock_quantity: 30,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
    is_active: true,
  },
  {
    product_id: 3,
    product_name: "Pet care starter kit",
    description: "Bowl, leash, and basic grooming supplies bundle.",
    price: 350_000,
    stock_quantity: 15,
    image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600",
    is_active: true,
  },
  {
    product_id: 4,
    product_name: "Sanctuary calendar 2026",
    description: "Monthly photos of rescued pets on their journey home.",
    price: 85_000,
    stock_quantity: 100,
    image_url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600",
    is_active: true,
  },
];

export const mockCampaigns: DonationCampaign[] = [
  {
    campaign_id: 1,
    title: "Emergency surgery fund",
    description: "Help cover operations for injured rescues this month.",
    target_amount: 50_000_000,
    raised_amount: 32_500_000,
    start_date: "2026-05-01",
    end_date: "2026-06-30",
    status: "ONGOING",
  },
  {
    campaign_id: 2,
    title: "Winter shelter warmth",
    description: "Heaters, blankets, and coats for dogs in outdoor kennels.",
    target_amount: 20_000_000,
    raised_amount: 20_000_000,
    start_date: "2026-01-01",
    end_date: "2026-03-31",
    status: "COMPLETED",
  },
  {
    campaign_id: 3,
    title: "Kitten formula & bottles",
    description: "Supplies for neonatal kittens in foster care.",
    target_amount: 8_000_000,
    raised_amount: 2_100_000,
    start_date: "2026-05-10",
    end_date: "2026-07-10",
    status: "ONGOING",
  },
];

export const demoUserOrders: PublicOrder[] = [
  {
    order_id: 7001,
    user_id: 101,
    items: [
      { product_id: 1, product_name: "PawsHopeNet T-shirt", quantity: 1, price: 150_000 },
      { product_id: 2, product_name: "Rescue tote bag", quantity: 1, price: 120_000 },
    ],
    subtotal_amount: 270_000,
    shipping_fee: 30_000,
    total_amount: 300_000,
    payment_method: "PAYPAL",
    payment_status: "PAID",
    order_status: "SHIPPING",
    shipping_address: "12 Nguyen Trai, Hanoi",
    receiver_name: "Jane Doe",
    receiver_phone: "+84 912 345 678",
    created_at: "2026-05-08 14:20",
  },
];

export const orderProgressSteps = [
  { status: "CONFIRMED", label: "Order confirmed", description: "We received your order." },
  { status: "PREPARING", label: "Preparing", description: "Items are being packed." },
  { status: "SHIPPING", label: "Shipping", description: "On the way to you." },
  { status: "DELIVERED", label: "Delivered", description: "Order completed." },
];

export function orderStatusIndex(status: string) {
  return orderProgressSteps.findIndex((s) => s.status === status);
}

export const donationQuickAmounts = [100_000, 200_000, 500_000, 1_000_000];

export const itemDonationCategories = [
  "FOOD",
  "MEDICAL_SUPPLY",
  "CLEANING",
  "EQUIPMENT",
  "OTHER",
] as const;
