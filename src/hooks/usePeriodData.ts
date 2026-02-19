import { useEffect, useState } from 'react';
import { TIME_PERIODS } from '@/utils/constants.ts';
import type { PeriodData } from '@/types/index.ts';

/**
 * Fetches GeoJSON data (areas, borders, points) for the given period.
 * Cancels in-flight requests when the period changes.
 */
export function usePeriodData(periodId: string): { data: PeriodData | null; isLoading: boolean } {
    const [data, setData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const periodConfig = Object.values(TIME_PERIODS).find(p => p.id === periodId);
        if (!periodConfig) return;

        const controller = new AbortController();
        const { signal } = controller;

        setIsLoading(true);
        setData(null);

        const base = import.meta.env.BASE_URL;

        const fetchJson = (url: string) =>
            fetch(url, { signal }).then(r => {
                if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
                return r.json();
            });

        Promise.all([
            fetchJson(`${base}data/${periodConfig.areasFile}.geojson`),
            fetchJson(`${base}data/${periodConfig.bordersFile}.geojson`),
            fetchJson(`${base}data/${periodConfig.pointsFile}.geojson`),
        ])
            .then(([areas, borders, points]) => {
                setData({ areas, borders, points });
                setIsLoading(false);
            })
            .catch(error => {
                if (error.name === 'AbortError') return;
                console.error('Failed to load geojson files:', error);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [periodId]);

    return { data, isLoading };
}
