// src/services/metrics.ts
import { getJSON } from "@/lib/api";

export type WeeklyMetricsDTO = {
    activeDays: number;
    activeMinutes: number;
    distanceKm: number;
    calories: number;
};

// GET /metrics/weekly?weekStart=YYYY-MM-DD
export async function fetchWeeklyMetrics(weekStartISO?: string): Promise<WeeklyMetricsDTO> {
    const qs = weekStartISO ? `?weekStart=${encodeURIComponent(weekStartISO)}` : "";
    return await getJSON<WeeklyMetricsDTO>(`/metrics/weekly${qs}`);
}
