import {
  demoUserOrders,
  mockCampaigns,
  mockProducts,
  type DonationCampaign,
  type PublicCartLine,
  type PublicItemDonation,
  type PublicMoneyDonation,
  type PublicOrder,
  type PublicProduct,
} from "@/data/public-mock";

const CART_KEY = "pawshope_public_cart";
const ORDERS_KEY = "pawshope_public_orders";
const MONEY_DONATIONS_KEY = "pawshope_public_money_donations";
const ITEM_DONATIONS_KEY = "pawshope_public_item_donations";
const CAMPAIGN_RAISED_KEY = "pawshope_campaign_raised_extra";

const SHIPPING_FEE = 30_000;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProducts(): PublicProduct[] {
  return mockProducts.filter((p) => p.is_active);
}

export function getProduct(productId: number): PublicProduct | undefined {
  return getProducts().find((p) => p.product_id === productId);
}

export function getCampaigns(): DonationCampaign[] {
  const extra = readJson<Record<string, number>>(CAMPAIGN_RAISED_KEY, {});
  return mockCampaigns.map((c) => ({
    ...c,
    raised_amount: c.raised_amount + (extra[String(c.campaign_id)] ?? 0),
  }));
}

export function getCampaign(campaignId: number): DonationCampaign | undefined {
  return getCampaigns().find((c) => c.campaign_id === campaignId);
}

function cartKey(userId: number) {
  return `${CART_KEY}_${userId}`;
}

export function getCart(userId: number): PublicCartLine[] {
  return readJson<PublicCartLine[]>(cartKey(userId), []);
}

export function getCartItemCount(userId: number): number {
  return getCart(userId).reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartDetails(userId: number) {
  const lines = getCart(userId);
  return lines
    .map((line) => {
      const product = getProduct(line.product_id);
      if (!product) return null;
      return {
        ...line,
        product,
        lineTotal: product.price * line.quantity,
      };
    })
    .filter(Boolean) as {
    product_id: number;
    quantity: number;
    product: PublicProduct;
    lineTotal: number;
  }[];
}

export function getCartSubtotal(userId: number) {
  return getCartDetails(userId).reduce((s, l) => s + l.lineTotal, 0);
}

export function addToCart(userId: number, productId: number, quantity = 1) {
  const product = getProduct(productId);
  if (!product) return false;
  const cart = getCart(userId);
  const existing = cart.find((l) => l.product_id === productId);
  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stock_quantity) return false;
  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.push({ product_id: productId, quantity });
  }
  writeJson(cartKey(userId), cart);
  return true;
}

export function updateCartQuantity(userId: number, productId: number, quantity: number) {
  const product = getProduct(productId);
  if (!product) return false;
  let cart = getCart(userId);
  if (quantity <= 0) {
    cart = cart.filter((l) => l.product_id !== productId);
  } else if (quantity > product.stock_quantity) {
    return false;
  } else {
    cart = cart.map((l) => (l.product_id === productId ? { ...l, quantity } : l));
  }
  writeJson(cartKey(userId), cart);
  return true;
}

export function removeFromCart(userId: number, productId: number) {
  writeJson(
    cartKey(userId),
    getCart(userId).filter((l) => l.product_id !== productId)
  );
}

export function clearCart(userId: number) {
  writeJson(cartKey(userId), []);
}

function allOrders(): PublicOrder[] {
  const custom = readJson<PublicOrder[]>(ORDERS_KEY, []);
  return [...custom, ...demoUserOrders];
}

export function getUserOrders(userId: number): PublicOrder[] {
  return allOrders()
    .filter((o) => o.user_id === userId)
    .sort((a, b) => b.order_id - a.order_id);
}

export function getOrderById(userId: number, orderId: number): PublicOrder | undefined {
  return getUserOrders(userId).find((o) => o.order_id === orderId);
}

export function checkout(
  userId: number,
  input: {
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    note?: string;
  }
): PublicOrder | null {
  const details = getCartDetails(userId);
  if (details.length === 0) return null;

  const subtotal = details.reduce((s, l) => s + l.lineTotal, 0);
  const orderId = Date.now();
  const order: PublicOrder = {
    order_id: orderId,
    user_id: userId,
    items: details.map((d) => ({
      product_id: d.product_id,
      product_name: d.product.product_name,
      quantity: d.quantity,
      price: d.product.price,
    })),
    subtotal_amount: subtotal,
    shipping_fee: SHIPPING_FEE,
    total_amount: subtotal + SHIPPING_FEE,
    payment_method: "PAYPAL",
    payment_status: "PAID",
    order_status: "CONFIRMED",
    shipping_address: input.shipping_address,
    receiver_name: input.receiver_name,
    receiver_phone: input.receiver_phone,
    note: input.note,
    created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
  };

  const orders = readJson<PublicOrder[]>(ORDERS_KEY, []);
  orders.unshift(order);
  writeJson(ORDERS_KEY, orders);
  clearCart(userId);
  return order;
}

export function donateMoney(input: {
  user_id?: number;
  campaign_id: number;
  donor_name: string;
  amount: number;
}): PublicMoneyDonation | null {
  const campaign = getCampaign(input.campaign_id);
  if (!campaign || input.amount <= 0) return null;

  const donation: PublicMoneyDonation = {
    donation_id: Date.now(),
    user_id: input.user_id,
    campaign_id: input.campaign_id,
    campaign_title: campaign.title,
    donor_name: input.donor_name,
    amount: input.amount,
    payment_method: "PAYPAL",
    payment_status: "PENDING",
    created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
  };

  const list = readJson<PublicMoneyDonation[]>(MONEY_DONATIONS_KEY, []);
  list.unshift(donation);
  writeJson(MONEY_DONATIONS_KEY, list);

  const extra = readJson<Record<string, number>>(CAMPAIGN_RAISED_KEY, {});
  extra[String(input.campaign_id)] = (extra[String(input.campaign_id)] ?? 0) + input.amount;
  writeJson(CAMPAIGN_RAISED_KEY, extra);

  return donation;
}

export function donateItem(input: {
  user_id?: number;
  donor_name: string;
  item_name: string;
  category: string;
  quantity: string;
  note?: string;
}): PublicItemDonation {
  const donation: PublicItemDonation = {
    item_donation_id: Date.now(),
    user_id: input.user_id,
    donor_name: input.donor_name,
    item_name: input.item_name,
    category: input.category,
    quantity: input.quantity,
    status: "PENDING",
    created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  const list = readJson<PublicItemDonation[]>(ITEM_DONATIONS_KEY, []);
  list.unshift(donation);
  writeJson(ITEM_DONATIONS_KEY, list);
  return donation;
}

export function getUserMoneyDonations(userId: number): PublicMoneyDonation[] {
  return readJson<PublicMoneyDonation[]>(MONEY_DONATIONS_KEY, []).filter((d) => d.user_id === userId);
}

export function getUserItemDonations(userId: number): PublicItemDonation[] {
  return readJson<PublicItemDonation[]>(ITEM_DONATIONS_KEY, []).filter((d) => d.user_id === userId);
}

export { SHIPPING_FEE };
