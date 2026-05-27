import { apiFetch } from "@/lib/api-client";
import type { OrganizationResDto } from "@/lib/api/mappers";
import { organization as mockOrg } from "@/data/mock";

export type PublicOrganization = {
  name: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  mission: string;
  facebook: string;
};

export function mapOrganizationRes(dto: OrganizationResDto): PublicOrganization {
  return {
    name: dto.orgName ?? mockOrg.name,
    tagline: mockOrg.tagline,
    hotline: dto.hotline ?? mockOrg.hotline,
    email: dto.email ?? mockOrg.email,
    address: dto.address ?? mockOrg.address,
    mission: dto.missionStatement ?? mockOrg.mission,
    facebook: dto.facebookLink ?? mockOrg.facebook,
  };
}

export async function fetchOrganizationInfo(): Promise<PublicOrganization> {
  const dto = await apiFetch<OrganizationResDto>("/organization_info");
  return mapOrganizationRes(dto);
}
