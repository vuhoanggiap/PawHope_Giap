import { useEffect, useState } from "react";
import { organization as mockOrg } from "@/data/mock";
import { getOrganizationSync, loadOrganization } from "@/lib/public-config";
import type { PublicOrganization } from "@/lib/api/organization-api";

export type OrganizationView = PublicOrganization & {
  stats: typeof mockOrg.stats;
};

const defaultOrg: OrganizationView = {
  ...getOrganizationSync(),
  stats: mockOrg.stats,
};

export function useOrganization(): OrganizationView {
  const [org, setOrg] = useState<OrganizationView>(defaultOrg);

  useEffect(() => {
    void loadOrganization().then((loaded) => {
      setOrg({ ...loaded, stats: mockOrg.stats });
    });
  }, []);

  return org;
}
