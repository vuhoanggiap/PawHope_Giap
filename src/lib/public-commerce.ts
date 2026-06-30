import {
  demoUserOrders,
  mockCampaigns,
  type DonationCampaign,
  type PublicCartLine,
  type PublicItemDonation,
  type PublicMoneyDonation,
  type PublicOrder,
  type PublicProduct,
} from "@/data/public-mock";
import { getActiveProducts, getProductById } from "@/lib/admin-store";
import { USE_MOCK } from "@/lib/api-client";
import {
  addCartItem,
  clearUserCart,
  fetchCartByUser,
  removeCartItem,
  updateCartItemQuantity,
  type ApiCartLine,
} from "@/lib/api/cart-api";
import { fetchActiveCampaigns } from "@/lib/api/donation-campaigns-api";
import { createDonation, fetchDonationsByUser } from "@/lib/api/donations-api";
import { createItemDonation, fetchItemDonationsByUser } from "@/lib/api/item-donations-api";
import { checkoutFromCart, fetchOrdersByUser, fetchOrderById } from "@/lib/api/orders-api";
import { fetchActiveProducts, fetchProductById } from "@/lib/api/products-api";
import { mapOrderRes } from "@/lib/api/mappers";

const CART_KEY = "pawshope_public_cart";
const ORDERS_KEY = "pawshope_public_orders";
const MONEY_DONATIONS_KEY = "pawshope_public_money_donations";
const ITEM_DONATIONS_KEY = "pawshope_public_item_donations";
const CAMPAIGN_RAISED_KEY = "pawshope_campaign_raised_extra";

export const SHIPPING_FEE = 30_000;

let apiProductCatalog: PublicProduct[] | null = null;
let catalogLoadPromise: Promise<PublicProduct[]> | null = null;
let apiCampaignsCache: DonationCampaign[] | null = null;
let apiCartCache = new Map<number, ApiCartLine[]>();
let apiOrdersCache = new Map<number, PublicOrder[]>();
let apiItemDonationsCache = new Map<number, PublicItemDonation[]>();

export function clearProductCatalogCache() {
  apiProductCatalog = null;
  catalogLoadPromise = null;
}

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

export async function loadProductCatalog(forceRefresh = false): Promise<PublicProduct[]> {
  if (USE_MOCK) {
    apiProductCatalog = getActiveProducts();
    return apiProductCatalog;
  }

  if (!forceRefresh && apiProductCatalog) return apiProductCatalog;

  if (!catalogLoadPromise) {
    catalogLoadPromise = fetchActiveProducts()
      .then((list) => {
        apiProductCatalog = list;
        return list;
      })
      .finally(() => {
        catalogLoadPromise = null;
      });
  }

  return catalogLoadPromise;
}

export async function loadProductById(
  productId: number,
  forceRefresh = false
): Promise<PublicProduct | undefined> {
  if (USE_MOCK) return getProductById(productId);

  if (forceRefresh) {
    try {
      const product = await fetchProductById(productId);

      if (apiProductCatalog) {
        const exists = apiProductCatalog.some((p) => p.product_id === productId);
        apiProductCatalog = exists
          ? apiProductCatalog.map((p) => (p.product_id === productId ? product : p))
          : [...apiProductCatalog, product];
      } else {
        apiProductCatalog = [product];
      }

      return product;
    } catch {
      return undefined;
    }
  }

  await loadProductCatalog();

  const cached = apiProductCatalog?.find((p) => p.product_id === productId);
  if (cached) return cached;

  try {
    const product = await fetchProductById(productId);

    if (apiProductCatalog) apiProductCatalog.push(product);
    else apiProductCatalog = [product];

    return product;
  } catch {
    return undefined;
  }
}

export function getProducts(): PublicProduct[] {
  if (USE_MOCK) return getActiveProducts();
  return apiProductCatalog ?? [];
}

export function getProduct(productId: number): PublicProduct | undefined {
  if (USE_MOCK) return getProductById(productId);

  return apiProductCatalog?.find((p) => p.product_id === productId);
}

export function getCampaigns(): DonationCampaign[] {
  if (!USE_MOCK && apiCampaignsCache) return apiCampaignsCache;

  const extra = readJson<Record<string, number>>(CAMPAIGN_RAISED_KEY, {});

  return mockCampaigns.map((c) => ({
    ...c,
    raised_amount: c.raised_amount + (extra[String(c.campaign_id)] ?? 0),
  }));
}

export async function loadCampaigns(): Promise<DonationCampaign[]> {
  if (USE_MOCK) return getCampaigns();

  if (apiCampaignsCache) return apiCampaignsCache;

  try {
    const list = await fetchActiveCampaigns();
    apiCampaignsCache = list.length > 0 ? list : getCampaigns();
    return apiCampaignsCache;
  } catch {
    return getCampaigns();
  }
}

export function getCampaign(campaignId: number): DonationCampaign | undefined {
  return getCampaigns().find((c) => c.campaign_id === campaignId);
}

function cartKey(userId: number) {
  return `${CART_KEY}_${userId}`;
}

function mockCartLines(userId: number): PublicCartLine[] {
  return readJson<PublicCartLine[]>(cartKey(userId), []);
}

export async function loadUserCart(userId: number): Promise<ApiCartLine[]> {
  if (USE_MOCK) {
    return mockCartLines(userId).map((l) => ({
      cart_id: 0,
      product_id: l.product_id,
      quantity: l.quantity,
      product_name: getProduct(l.product_id)?.product_name ?? "",
      price: getProduct(l.product_id)?.price ?? 0,
      stock_quantity: getProduct(l.product_id)?.stock_quantity ?? 999,
      image_url: getProduct(l.product_id)?.image_url ?? "",
    }));
  }

  try {
    const lines = await fetchCartByUser(userId);
    apiCartCache.set(userId, lines as any);
    return lines as any;
  } catch {
    return [];
  }
}

export function getCart(userId: number): PublicCartLine[] {
  const api = apiCartCache.get(userId);

  if (!USE_MOCK && api) {
    return api.map((l) => ({
      cart_id: l.cart_id,
      product_id: l.product_id,
      quantity: l.quantity,
    }));
  }

  return mockCartLines(userId);
}

export function getCartItemCount(userId: number): number {
  return getCart(userId).reduce((sum, line) => sum + line.quantity, 0);
}

export async function loadCartItemCount(userId: number): Promise<number> {
  await loadUserCart(userId);
  return getCartItemCount(userId);
}

export function getCartDetails(userId: number) {
  const api = apiCartCache.get(userId);

  if (!USE_MOCK && api) {
    return api.map((l) => ({
      cart_id: l.cart_id,
      product_id: l.product_id,
      quantity: l.quantity,
      product: {
        product_id: l.product_id,
        product_name: l.product_name,
        description: "",
        price: l.price,
        stock_quantity: getProduct(l.product_id)?.stock_quantity ?? 999,
        image_url: getProduct(l.product_id)?.image_url ?? "",
        is_active: true,
      } as PublicProduct,
      lineTotal: l.price * l.quantity,
    }));
  }

  const lines = mockCartLines(userId);

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
    cart_id?: number;
    product_id: number;
    quantity: number;
    product: PublicProduct;
    lineTotal: number;
  }[];
}

export function getCartSubtotal(userId: number) {
  return getCartDetails(userId).reduce((s, l) => s + l.lineTotal, 0);
}

export async function addToCart(
  userId: number,
  productId: number,
  quantity = 1
): Promise<boolean> {
  if (USE_MOCK) {
    const product = getProduct(productId);
    if (!product) return false;

    const cart = mockCartLines(userId);
    const existing = cart.find((l) => l.product_id === productId);
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (newQty > product.stock_quantity) return false;

    if (existing) existing.quantity = newQty;
    else cart.push({ product_id: productId, quantity });

    writeJson(cartKey(userId), cart);
    return true;
  }

  try {
    await addCartItem(userId, productId, quantity);
    clearProductCatalogCache();
    await loadUserCart(userId);
    return true;
  } catch {
    return false;
  }
}

export async function updateCartQuantity(
  userId: number,
  productId: number,
  quantity: number
): Promise<boolean> {
  if (USE_MOCK) {
    const product = getProduct(productId);
    if (!product) return false;

    let cart = mockCartLines(userId);

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

  const lines = apiCartCache.get(userId) ?? (await loadUserCart(userId));
  const line = lines.find((l) => l.product_id === productId);

  if (!line) return false;

  try {
    if (quantity <= 0) await removeCartItem(line.cart_id);
    else await updateCartItemQuantity(line.cart_id, quantity);

    clearProductCatalogCache();
    await loadUserCart(userId);

    return true;
  } catch {
    return false;
  }
}

export async function removeFromCart(userId: number, productId: number) {
  return updateCartQuantity(userId, productId, 0);
}

export async function clearCart(userId: number) {
  if (USE_MOCK) {
    writeJson(cartKey(userId), []);
    return;
  }

  try {
    await clearUserCart(userId);
    apiCartCache.set(userId, []);
    clearProductCatalogCache();
  } catch {
    writeJson(cartKey(userId), []);
  }
}

function allOrders(): PublicOrder[] {
  return [...readJson<PublicOrder[]>(ORDERS_KEY, []), ...demoUserOrders];
}

export function getUserOrders(userId: number): PublicOrder[] {
  const cached = apiOrdersCache.get(userId);

  if (!USE_MOCK && cached) return cached;

  return allOrders()
    .filter((o) => o.user_id === userId)
    .sort((a, b) => b.order_id - a.order_id);
}

export async function loadUserOrders(userId: number): Promise<PublicOrder[]> {
  if (USE_MOCK) return getUserOrders(userId);

  try {
    const list = await fetchOrdersByUser(userId);
    apiOrdersCache.set(userId, list);
    return list;
  } catch {
    return getUserOrders(userId);
  }
}

export function getOrderById(userId: number, orderId: number): PublicOrder | undefined {
  return getUserOrders(userId).find((o) => o.order_id === orderId);
}

export async function loadOrderById(
  userId: number,
  orderId: number
): Promise<PublicOrder | undefined> {
  if (USE_MOCK) return getOrderById(userId, orderId);

  try {
    const order = await fetchOrderById(orderId);
    if (order.user_id !== userId) return undefined;
    return order;
  } catch {
    return getOrderById(userId, orderId);
  }
}

export async function checkout(
  userId: number,
  input: {
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    note?: string;
  }
): Promise<PublicOrder | null> {
  if (USE_MOCK) {
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

    await clearCart(userId);

    return order;
  }

  try {
    const dto = await checkoutFromCart({
      userId,
      shippingFee: SHIPPING_FEE,
      shippingAddress: input.shipping_address,
      receiverName: input.receiver_name,
      receiverPhone: input.receiver_phone,
      note: input.note,
    });

    const order = mapOrderRes(dto as any);

    apiOrdersCache.set(userId, [order, ...(apiOrdersCache.get(userId) ?? [])]);
    apiCartCache.set(userId, []);
    clearProductCatalogCache();

    return order;
  } catch {
    return null;
  }
}

export async function donateMoney(input: {
  user_id?: number;
  campaign_id: number;
  donor_name: string;
  amount: number;
}): Promise<PublicMoneyDonation | null> {
  const campaign = getCampaign(input.campaign_id);

  if (!campaign || input.amount <= 0) return null;

  if (USE_MOCK) {
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
    extra[String(input.campaign_id)] =
      (extra[String(input.campaign_id)] ?? 0) + input.amount;

    writeJson(CAMPAIGN_RAISED_KEY, extra);

    return donation;
  }

  try {
    const d = await createDonation({
      campaignId: input.campaign_id,
      userId: input.user_id,
      donorNameManual: input.donor_name,
      amount: input.amount,
      donationType: "MONEY",
      paymentStatus: "PENDING",
    });

    return {
      ...d,
      campaign_title: campaign.title,
      donor_name: input.donor_name,
    };
  } catch {
    return null;
  }
}

export async function donateItem(input: {
  user_id?: number;
  donor_name: string;
  item_name: string;
  category: string;
  quantity: string;
  note?: string;
}): Promise<PublicItemDonation> {
  if (USE_MOCK) {
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

  return createItemDonation({
    userId: input.user_id,
    donorNameManual: input.donor_name,
    itemName: input.item_name,
    category: input.category,
    quantity: input.quantity,
    note: input.note,
  });
}

export function getUserMoneyDonations(userId: number): PublicMoneyDonation[] {
  return readJson<PublicMoneyDonation[]>(MONEY_DONATIONS_KEY, []).filter(
    (d) => d.user_id === userId
  );
}

export function getUserItemDonations(userId: number): PublicItemDonation[] {
  return readJson<PublicItemDonation[]>(ITEM_DONATIONS_KEY, []).filter(
    (d) => d.user_id === userId
  );
}

export async function loadUserDonations(userId: number): Promise<{
  money: PublicMoneyDonation[];
  items: PublicItemDonation[];
}> {
  if (USE_MOCK) {
    return {
      money: getUserMoneyDonations(userId),
      items: getUserItemDonations(userId),
    };
  }

  try {
    await loadCampaigns();

    const [money, items] = await Promise.all([
      fetchDonationsByUser(userId),
      fetchItemDonationsByUser(userId),
    ]);

    const mappedMoney = money.map((d) => {
      const campaign = getCampaign(d.campaign_id);
      return {
        ...d,
        campaign_title: d.campaign_title || campaign?.title || `Campaign #${d.campaign_id}`,
      };
    });

    apiItemDonationsCache.set(userId, items);

    return { money: mappedMoney, items };
  } catch {
    return {
      money: getUserMoneyDonations(userId),
      items: getUserItemDonations(userId),
    };
  }
}