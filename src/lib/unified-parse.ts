import { ApiRequestError } from '@/lib/api-errors'
import { API_ENDPOINTS } from '@/lib/config'
import { notifyTodayParseStatsChanged } from '@/lib/parse-stats'
import type { UnifiedParseResult } from '@/lib/types'

const UNIFIED_PARSE_RELOAD_THRESHOLD = 60

export type UnifiedParseSuccessResult = UnifiedParseResult & {
    success: true
    data: NonNullable<UnifiedParseResult['data']>
}

let unifiedParseAttemptCount = 0
const pendingParses = new Map<string, Promise<UnifiedParseSuccessResult>>()
let parseCooldown: { until: number; error: ApiRequestError } | undefined

export class UnifiedParseReloadError extends Error {
    constructor() {
        super('Unified parse threshold reached')
        this.name = 'UnifiedParseReloadError'
    }
}

export function resetUnifiedParseAttemptCountForTests() {
    unifiedParseAttemptCount = 0
    pendingParses.clear()
    parseCooldown = undefined
}

function maybeReloadUnifiedParsePage(): boolean {
    if (typeof window === 'undefined') {
        return false
    }

    if (unifiedParseAttemptCount >= UNIFIED_PARSE_RELOAD_THRESHOLD) {
        window.location.reload()
        return true
    }

    unifiedParseAttemptCount += 1
    return false
}

export function requestUnifiedParse(videoUrl: string): Promise<UnifiedParseSuccessResult> {
    if (parseCooldown && Date.now() < parseCooldown.until) {
        return Promise.reject(parseCooldown.error)
    }
    const pending = pendingParses.get(videoUrl)
    if (pending) return pending
    const request = fetchUnifiedParse(videoUrl).finally(() => pendingParses.delete(videoUrl))
    pendingParses.set(videoUrl, request)
    return request
}

async function fetchUnifiedParse(videoUrl: string): Promise<UnifiedParseSuccessResult> {
    if (maybeReloadUnifiedParsePage()) {
        throw new UnifiedParseReloadError()
    }

    const params = new URLSearchParams({ url: videoUrl })
    const requestUrl = `${API_ENDPOINTS.unified.parse}?${params.toString()}`
    const response = await fetch(requestUrl, {
        method: 'GET',
        cache: 'no-store',
    })

    let payload: UnifiedParseResult | null = null
    try {
        payload = await response.json() as UnifiedParseResult
    } catch {
        // A non-JSON 429 still carries Retry-After and must stop repeat calls.
        payload = null
    }

    if (!response.ok || !payload?.success || !payload.data) {
        const error = new ApiRequestError({
            code: payload?.code,
            status: payload?.status ?? response.status,
            requestId: payload?.requestId,
            details: payload?.details,
            fallbackMessage: payload?.error || payload?.message,
        })
        if (response.status === 429 && payload?.code !== 'UPSTREAM_RATE_LIMITED') {
            const retryAfter = response.headers.get('Retry-After')
            const seconds = retryAfter?.trim() ? Number(retryAfter) : NaN
            const resetAt = retryAfter && !Number.isFinite(seconds) ? Date.parse(retryAfter) : NaN
            const detailSeconds = Number(payload?.details?.retryAfterSeconds)
            const delayMs = Number.isFinite(seconds) && seconds >= 0
                ? seconds * 1000
                : Number.isFinite(resetAt)
                    ? Math.max(0, resetAt - Date.now())
                    : Number.isFinite(detailSeconds) && detailSeconds >= 0
                        ? detailSeconds * 1000 : 60_000
            parseCooldown = { until: Date.now() + delayMs, error }
        }
        throw error
    }

    notifyTodayParseStatsChanged()
    return payload as UnifiedParseSuccessResult
}
