'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    fetchTodayParseStats,
    TODAY_PARSE_STATS_REFRESH_EVENT,
    type TodayParseStats,
} from '@/lib/parse-stats';
import type { Dictionary } from '@/lib/i18n/types';

const STATS_REFRESH_INTERVAL_MS = 60_000;
const COUNT_ANIMATION_DURATION_MS = 350;

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface TodayStatsCardProps {
    dict: Pick<Dictionary, 'todayStats'>;
}

export function TodayStatsCard({ dict }: TodayStatsCardProps) {
    const [stats, setStats] = useState<TodayParseStats | null>(null);
    const [displayCounts, setDisplayCounts] = useState({ today: 0, total: 0 });
    const displayedCountsRef = useRef<{ today: number; total: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        let disposed = false;
        let latestRequestId = 0;
        const controllers = new Set<AbortController>();

        const refreshStats = (cacheBuster?: string | number) => {
            const requestId = latestRequestId + 1;
            latestRequestId = requestId;
            const controller = new AbortController();
            controllers.add(controller);

            void fetchTodayParseStats({ signal: controller.signal, cacheBuster })
                .then((result) => {
                    if (!disposed && !controller.signal.aborted && requestId === latestRequestId) {
                        if (result && displayedCountsRef.current === null) {
                            const initialCounts = { today: result.count, total: result.totalCount };
                            displayedCountsRef.current = initialCounts;
                            setDisplayCounts(initialCounts);
                        }
                        setStats(result);
                    }
                })
                .finally(() => {
                    controllers.delete(controller);
                });
        };

        const handleParseSuccess = (event: Event) => {
            const cacheBuster = (event as CustomEvent<number>).detail || Date.now();
            refreshStats(cacheBuster);
        };

        refreshStats();
        const intervalId = window.setInterval(refreshStats, STATS_REFRESH_INTERVAL_MS);
        window.addEventListener(TODAY_PARSE_STATS_REFRESH_EVENT, handleParseSuccess);

        return () => {
            disposed = true;
            window.clearInterval(intervalId);
            window.removeEventListener(TODAY_PARSE_STATS_REFRESH_EVENT, handleParseSuccess);
            controllers.forEach((controller) => controller.abort());
        };
    }, []);

    useEffect(() => {
        if (!stats) {
            return;
        }

        const targetCounts = { today: stats.count, total: stats.totalCount };

        const previousCounts = displayedCountsRef.current;
        const shouldAnimateToday = previousCounts !== null && targetCounts.today > previousCounts.today;
        const shouldAnimateTotal = previousCounts !== null && targetCounts.total > previousCounts.total;
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (previousCounts === null
            || (!shouldAnimateToday && !shouldAnimateTotal)
            || prefersReducedMotion()) {
            displayedCountsRef.current = targetCounts;
            setDisplayCounts(targetCounts);
            return;
        }

        const startedAt = performance.now();
        const updateCount = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / COUNT_ANIMATION_DURATION_MS);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const nextCounts = {
                today: shouldAnimateToday
                    ? Math.round(previousCounts.today + (targetCounts.today - previousCounts.today) * easedProgress)
                    : targetCounts.today,
                total: shouldAnimateTotal
                    ? Math.round(previousCounts.total + (targetCounts.total - previousCounts.total) * easedProgress)
                    : targetCounts.total,
            };

            displayedCountsRef.current = nextCounts;
            setDisplayCounts(nextCounts);

            if (progress < 1) {
                animationFrameRef.current = window.requestAnimationFrame(updateCount);
            } else {
                animationFrameRef.current = null;
            }
        };

        animationFrameRef.current = window.requestAnimationFrame(updateCount);
        return () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [stats]);

    // 拉取失败时不占位，避免显示不可靠的统计数据。
    if (!stats) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    {dict.todayStats.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
                <div className="min-w-0">
                    <p className="break-words text-sm text-foreground/75">
                        {stats.totalPeriodDays === 30 ? dict.todayStats.last30DaysLabel : dict.todayStats.totalCountLabel}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                        {stats.estimated ? '≈ ' : ''}{displayCounts.total.toLocaleString()}
                    </p>
                </div>
                <div className="min-w-0">
                    <p className="break-words text-sm text-foreground/75">
                        {dict.todayStats.todayCountLabel}
                    </p>
                    <p className="mt-2 text-2xl font-medium tabular-nums">
                        {stats.estimated ? '≈ ' : ''}{displayCounts.today.toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
