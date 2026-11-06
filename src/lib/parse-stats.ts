import { API_ENDPOINTS } from './config'
import type { UnifiedApiResponse } from './types'

export const TODAY_PARSE_STATS_REFRESH_EVENT = 'today-parse-stats-refresh'

export interface TodayParseStats {
    date: string
    timezone: string
    windowStart: string
    windowEnd: string
    count: number
    totalCount: number
    totalPeriodDays?: number
    estimated?: boolean
}

function isTodayParseStats(value: unknown): value is TodayParseStats {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<TodayParseStats>
    return typeof candidate.date === 'string'
        && typeof candidate.count === 'number'
        && Number.isFinite(candidate.count)
        && candidate.count >= 0
        && typeof candidate.totalCount === 'number'
        && Number.isFinite(candidate.totalCount)
        && candidate.totalCount >= 0
}

/**
 * 拉取今日解析次数。展示型数据，失败时返回 null 由调用方静默隐藏。
 */
export async function fetchTodayParseStats(
    options?: { signal?: AbortSignal; cacheBuster?: string | number }
): Promise<TodayParseStats | null> {
    try {
        const cacheBuster = options?.cacheBuster
        const requestUrl = cacheBuster === undefined
            ? API_ENDPOINTS.stats.today
            : `${API_ENDPOINTS.stats.today}${API_ENDPOINTS.stats.today.includes('?') ? '&' : '?'}refresh=${encodeURIComponent(String(cacheBuster))}`
        const response = await fetch(requestUrl, {
            signal: options?.signal,
        })

        if (!response.ok) {
            return null
        }

        const result = await response.json() as UnifiedApiResponse<TodayParseStats>
        if (!result.success || !isTodayParseStats(result.data)) {
            return null
        }

        return result.data
    } catch {
        return null
    }
}

export function notifyTodayParseStatsChanged(): void {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
        return
    }

    window.dispatchEvent(new CustomEvent(TODAY_PARSE_STATS_REFRESH_EVENT, {
        detail: Date.now(),
    }))
}
