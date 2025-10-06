// src/hooks/useWeeklyMetrics.ts
import { bus } from "@/lib/bus";
import { fetchWeeklyMetrics, WeeklyMetricsDTO } from "@/services/metrics";
import { useEffect, useState } from "react";

export function useWeeklyMetrics(weekStartISO?: string) {
    const [data, setData] = useState<WeeklyMetricsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // "tick" força o efeito de carregamento a rodar de novo quando emitirmos o evento
    const [tick, setTick] = useState(0);

    // Ouve "metrics:refresh" para refazer o fetch
    useEffect(() => {
        const onRefresh = () => setTick((t) => t + 1);
        bus.on("metrics:refresh", onRefresh);
        return () => {
            bus.off("metrics:refresh", onRefresh);
        };
    }, []);

    // Carrega / recarrega
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const d = await fetchWeeklyMetrics(weekStartISO);
                if (mounted) setData(d);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Falha ao carregar métricas");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [weekStartISO, tick]); // <- reexecuta quando dispararmos o evento

    // opção: expor um refresh manual (útil em pull-to-refresh)
    const refresh = () => setTick((t) => t + 1);

    return { data, loading, error, refresh };
}
