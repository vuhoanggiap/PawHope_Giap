import { adoptionGuidelines, organization } from "@/data/mock";
import { mockProducts, type PublicProduct } from "@/data/public-mock";

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

export function getAllProducts(): PublicProduct[] {
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
}

export function toggleProductActive(productId: number) {
  const list = getAllProducts().map((p) =>
    p.product_id === productId ? { ...p, is_active: !p.is_active } : p
  );
  writeJson(PRODUCTS_KEY, list);
}

export function getOrganization(): AdminOrganization {
  return readJson(ORG_KEY, defaultOrg);
}

export function saveOrganization(org: AdminOrganization) {
  writeJson(ORG_KEY, org);
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
