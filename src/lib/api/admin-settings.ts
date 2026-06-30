import { apiFetch } from "@/lib/api-client";

export type OrganizationInfoReq = {
  orgName: string;
  tagline: string;
  hotline: string;
  email: string;
  address: string;
  missionStatement: string;
  facebookLink: string;
  logoUrl?: string;
};

export type OrganizationInfoRes = OrganizationInfoReq;

export type AdoptionGuidelineReq = {
  title: string;
  content: string;
  imageUrl?: string;
  priority: number;
};

export type AdoptionGuidelineRes = {
  guideId: number;
  title: string;
  content: string;
  imageUrl?: string;
  priority: number;
};

export const getOrganizationApi = async () => {
  return apiFetch<OrganizationInfoRes>("/organization_info");
};

export const saveOrganizationApi = async (data: OrganizationInfoReq) => {
  return apiFetch<OrganizationInfoRes>("/organization_info", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getGuidelinesApi = async () => {
  return apiFetch<AdoptionGuidelineRes[]>("/adoption_guidelines");
};

export const createGuidelineApi = async (data: AdoptionGuidelineReq) => {
  return apiFetch<AdoptionGuidelineRes>("/adoption_guidelines", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateGuidelineApi = async (id: number, data: AdoptionGuidelineReq) => {
  return apiFetch<AdoptionGuidelineRes>(`/adoption_guidelines/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteGuidelineApi = async (id: number) => {
  return apiFetch(`/adoption_guidelines/${id}`, {
    method: "DELETE",
  });
};