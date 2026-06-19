import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { STORAGE_KEYS } from "./config";
import type { OutageReport } from "@/types";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    staleTime: 60_000,
    retry: 0,
  });
}

function localOutages(): OutageReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.outageReports);
    return raw ? (JSON.parse(raw) as OutageReport[]) : [];
  } catch {
    return [];
  }
}

function saveLocalOutages(reports: OutageReport[]) {
  localStorage.setItem(STORAGE_KEYS.outageReports, JSON.stringify(reports));
}

export function useOutages() {
  return useQuery({
    queryKey: ["outages"],
    queryFn: async (): Promise<OutageReport[]> => {
      try {
        const res = await api.getOutages();
        return res.reports;
      } catch {
        return localOutages();
      }
    },
  });
}

export function useReportOutage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: Omit<OutageReport, "id" | "timestamp">) => {
      const full: OutageReport = {
        ...report,
        id: `local-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      try {
        return await api.createOutage(full);
      } catch {
        const next = [full, ...localOutages()];
        saveLocalOutages(next);
        return full;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outages"] }),
  });
}
