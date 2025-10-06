//src/hooks/useChallenges.ts
import { Challenge, listChallenges } from "@/services/challenges";
import { useEffect, useState } from "react";

export function useChallenges() {
    const [data, setData] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await listChallenges();
                setData(res);
            } catch (e: any) {
                setError(e?.message ?? "Falha ao carregar desafios");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { data, loading, error };
}
