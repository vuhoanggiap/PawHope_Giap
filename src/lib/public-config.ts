import { organization } from "@/data/mock";
import { USE_MOCK } from "@/lib/api-client";
import { fetchOrganizationInfo, type PublicOrganization } from "@/lib/api/organization-api";

let cachedOrg: PublicOrganization | null = null;

export function getOrganizationSync(): PublicOrganization {
  if (cachedOrg) return cachedOrg;
  return {
    name: organization.name,
    tagline: organization.tagline,
    hotline: organization.hotline,
    email: organization.email,
    address: organization.address,
    mission: organization.mission,
    facebook: organization.facebook,
  };
}

export async function loadOrganization(): Promise<PublicOrganization> {
  if (USE_MOCK) return getOrganizationSync();
  if (cachedOrg) return cachedOrg;
  try {
    cachedOrg = await fetchOrganizationInfo();
    return cachedOrg;
  } catch {
    return getOrganizationSync();
  }
}
