import { useEffect, useState } from "react";
import {
  DEFAULT_CAMPAIGN_SETTINGS,
  getCurrentCampaignSettings,
  type CampaignSettings,
} from "@/services/campaigns";

const STORAGE_KEY = "base-eleitoral-campaign-settings";
export const CAMPAIGN_SETTINGS_UPDATED = "campaign-settings-updated";

export function useCampaignSettings() {
  const [settings, setSettings] = useState<CampaignSettings>(() => readCachedSettings());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getCurrentCampaignSettings()
      .then((data) => {
        if (!mounted) return;
        setSettings(data);
        cacheSettings(data);
        setError(null);
      })
      .catch((requestError) => {
        if (!mounted) return;
        setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar a campanha.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<CampaignSettings>).detail;
      if (detail) {
        setSettings(detail);
        cacheSettings(detail);
      }
    };

    window.addEventListener(CAMPAIGN_SETTINGS_UPDATED, listener);
    return () => {
      mounted = false;
      window.removeEventListener(CAMPAIGN_SETTINGS_UPDATED, listener);
    };
  }, []);

  return { settings, loading, error };
}

export function notifyCampaignSettingsUpdated(settings: CampaignSettings) {
  cacheSettings(settings);
  window.dispatchEvent(new CustomEvent(CAMPAIGN_SETTINGS_UPDATED, { detail: settings }));
}

function readCachedSettings(): CampaignSettings {
  if (typeof window === "undefined") return DEFAULT_CAMPAIGN_SETTINGS;

  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    return cached ? { ...DEFAULT_CAMPAIGN_SETTINGS, ...JSON.parse(cached) } : DEFAULT_CAMPAIGN_SETTINGS;
  } catch {
    return DEFAULT_CAMPAIGN_SETTINGS;
  }
}

function cacheSettings(settings: CampaignSettings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Local cache is optional; Supabase remains the source of truth.
  }
}
