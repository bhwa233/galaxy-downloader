import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTodayParseStats } from '@/lib/parse-stats'

function mockFetch(response: unknown, options?: { ok?: boolean }) {
    const fetchMock = vi.fn(async () => ({
        ok: options?.ok ?? true,
        json: async () => response,
    }))

    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

describe('fetchTodayParseStats', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('returns stats on a successful response', async () => {
        const payload = {
            date: '2026-08-13',
            timezone: 'UTC+08:00',
            windowStart: '2026-08-12T16:00:00.000Z',
            windowEnd: '2026-08-13T16:00:00.000Z',
            count: 1234,
            totalCount: 5678,
        }
        const fetchMock = mockFetch({ success: true, data: payload })

        await expect(fetchTodayParseStats()).resolves.toEqual(payload)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('adds a cache buster for an immediate refresh', async () => {
        const fetchMock = mockFetch({ success: true, data: {
            date: '2026-08-13',
            timezone: 'UTC+08:00',
            windowStart: '2026-08-12T16:00:00.000Z',
            windowEnd: '2026-08-13T16:00:00.000Z',
            count: 1234,
            totalCount: 5678,
        } })

        await fetchTodayParseStats({ cacheBuster: 'parse-complete' })

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/stats/today?refresh=parse-complete',
            expect.any(Object)
        )
    })

    it('returns null on a non-ok response', async () => {
        mockFetch({ success: false }, { ok: false })

        await expect(fetchTodayParseStats()).resolves.toBeNull()
    })

    it('returns null when the payload shape is unexpected', async () => {
        mockFetch({ success: true, data: { date: '2026-08-13', count: 'many' } })

        await expect(fetchTodayParseStats()).resolves.toBeNull()
    })

    it('returns null when the request throws', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => {
            throw new Error('network down')
        }))

        await expect(fetchTodayParseStats()).resolves.toBeNull()
    })
})
