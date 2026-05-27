import { useCallback, useEffect, useState } from "react";
import type { DonationCampaign } from "@/data/public-mock";
import { ApiError, USE_MOCK } from "@/lib/api-client";
import { getCampaigns, loadCampaigns } from "@/lib/public-commerce";

export function useDonateCampaigns() {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(() => getCampaigns());
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (USE_MOCK) {
      setCampaigns(getCampaigns());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setCampaigns(await loadCampaigns());
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load campaigns");
      setCampaigns(getCampaigns());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { campaigns, loading, error, reload };
}
