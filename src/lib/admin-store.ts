import { adoptionGuidelines, organization } from "@/data/mock";
import { mockProducts, type PublicProduct } from "@/data/public-mock";
import { USE_MOCK } from "@/lib/api-client";
import { fetchAdoptionGuidelines } from "@/lib/api/adoption-guidelines-api";
import { fetchOrganizationInfo } from "@/lib/api/organization-api";
import {
  fetchAllProducts,
  saveProductApi,
  toggleProductActiveApi,
} from "@/lib/api/products-api";

const PRODUCTS_KEY = "pawshope_admin_products";
const ORG_KEY = "pawshope_admin_organization";
const GUIDELINES_KEY = "pawshope_admin_guidelines";

export interface AdminOrganization {
  name: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  mission: string;
  facebook: string;
  logo_url?: string;
}

export interface AdminGuideline {
  guide_id: number;
  title: string;
  content: string;
  priority: number;
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

const defaultOrg: AdminOrganization = {
  name: organization.name,
  tagline: organization.tagline,
  hotline: organization.hotline,
  email: organization.email,
  address: organization.address,
  mission: organization.mission,
  facebook: organization.facebook,
};

const defaultGuidelines: AdminGuideline[] = adoptionGuidelines.map((g) => ({
  guide_id: g.id,
  title: g.title,
  content: g.content,
  priority: g.priority,
}));

let apiAdminProducts: PublicProduct[] | null = null;

export async function loadAllProducts(): Promise<PublicProduct[]> {
  if (USE_MOCK) {
    apiAdminProducts = readJson<PublicProduct[]>(PRODUCTS_KEY, mockProducts);
    return apiAdminProducts;
  }
  if (apiAdminProducts) return apiAdminProducts;
  try {
    apiAdminProducts = await fetchAllProducts();
    return apiAdminProducts;
  } catch {
    return readJson<PublicProduct[]>(PRODUCTS_KEY, mockProducts);
  }
}

export function getAllProducts(): PublicProduct[] {
  if (!USE_MOCK && apiAdminProducts) return apiAdminProducts;
  return readJson<PublicProduct[]>(PRODUCTS_KEY, mockProducts);
}

export function getActiveProducts(): PublicProduct[] {
  return getAllProducts().filter((p) => p.is_active);
}

export function getProductById(productId: number): PublicProduct | undefined {
  return getAllProducts().find((p) => p.product_id === productId);
}

export function saveProduct(product: PublicProduct) {
  const list = getAllProducts();
  const idx = list.findIndex((p) => p.product_id === product.product_id);
  if (idx >= 0) list[idx] = product;
  else list.unshift(product);
  writeJson(PRODUCTS_KEY, list);
  if (!USE_MOCK) apiAdminProducts = list;
}

export async function saveProductToStore(product: PublicProduct, isNew: boolean) {
  if (USE_MOCK) {
    saveProduct(product);
    return;
  }
  const dto = await saveProductApi(product, isNew);
  apiAdminProducts = null;
  await loadAllProducts();
  if (isNew && dto.productId) product.product_id = dto.productId;
}

export function toggleProductActive(productId: number) {
  const list = getAllProducts().map((p) =>
    p.product_id === productId ? { ...p, is_active: !p.is_active } : p
  );
  writeJson(PRODUCTS_KEY, list);
  if (!USE_MOCK) apiAdminProducts = list;
}

export async function toggleProductActiveInStore(productId: number) {
  if (USE_MOCK) {
    toggleProductActive(productId);
    return;
  }
  const p = getProductById(productId);
  if (!p) return;
  await toggleProductActiveApi(productId, !p.is_active);
  apiAdminProducts = null;
  await loadAllProducts();
}

export async function loadOrganization(): Promise<AdminOrganization> {
  if (USE_MOCK) return getOrganization();
  try {
    const org = await fetchOrganizationInfo();
    const mapped: AdminOrganization = {
      name: org.name,
      tagline: org.tagline,
      hotline: org.hotline,
      email: org.email,
      address: org.address,
      mission: org.mission,
      facebook: org.facebook,
    };
    writeJson(ORG_KEY, mapped);
    return mapped;
  } catch {
    return getOrganization();
  }
}

export function getOrganization(): AdminOrganization {
  return readJson(ORG_KEY, defaultOrg);
}

export function saveOrganization(org: AdminOrganization) {
  writeJson(ORG_KEY, org);
}

export async function loadAdoptionGuidelines(): Promise<AdminGuideline[]> {
  if (USE_MOCK) return getAdoptionGuidelines();
  try {
    const list = await fetchAdoptionGuidelines();
    const mapped = list.map((g) => ({
      guide_id: g.id,
      title: g.title,
      content: g.content,
      priority: g.priority,
    }));
    writeJson(GUIDELINES_KEY, mapped);
    return mapped;
  } catch {
    return getAdoptionGuidelines();
  }
}

export function getAdoptionGuidelines(): AdminGuideline[] {
  return readJson(GUIDELINES_KEY, defaultGuidelines).sort((a, b) => a.priority - b.priority);
}

export function saveAdoptionGuidelines(items: AdminGuideline[]) {
  writeJson(GUIDELINES_KEY, items);
}

export function saveGuideline(item: AdminGuideline) {
  const list = getAdoptionGuidelines();
  const idx = list.findIndex((g) => g.guide_id === item.guide_id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  saveAdoptionGuidelines(list.sort((a, b) => a.priority - b.priority));
}
