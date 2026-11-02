import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UnifiedParseResult } from '../src/lib/types.ts'
import {
    UnifiedParseReloadError,
    requestUnifiedParse,
    resetUnifiedParseAttemptCountForTests,
} from '../src/lib/unified-parse.ts'
import { TODAY_PARSE_STATS_REFRESH_EVENT } from '../src/lib/parse-stats.ts'

const responsePayload = {
    success: true,
    data: {
        title: 'Parsed title',
        platform: 'youtube',
        downloadAudioUrl: null,
        downloadVideoUrl: null,
        originDownloadVideoUrl: null,
        url: 'https://example.com/watch?v=1',
    },
} satisfies UnifiedParseResult

describe('requestUnifiedParse reload guard', () => {
    const reload = vi.fn()
    const dispatchEvent = vi.fn()
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
            'content-type': 'application/json',
        },
    }))

    beforeEach(() => {
        resetUnifiedParseAttemptCountForTests()
        reload.mockClear()
        dispatchEvent.mockClear()
        fetchMock.mockClear()

        vi.stubGlobal('window', {
            location: {
                reload,
            },
            dispatchEvent,
        } as never)

        vi.stubGlobal('fetch', fetchMock as never)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
        resetUnifiedParseAttemptCountForTests()
    })

    it('shares one network request for concurrent parses of the same link', async () => {
        const [first, second] = await Promise.all([
            requestUnifiedParse('https://example.com/same'),
            requestUnifiedParse('https://example.com/same'),
        ])
        expect(first).toEqual(second)
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(dispatchEvent).toHaveBeenCalledTimes(1)
    })

    // Production had thousands of repeat requests after the hourly quota.
    it('stops requests until Retry-After expires and then allows another parse', async () => {
        const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
        const limitedFetch = vi.fn()
            .mockResolvedValueOnce(Response.json({ success: false, code: 'RATE_LIMITED' }, {
                status: 429, headers: { 'Retry-After': '10' },
            }))
            .mockImplementation(async () => Response.json(responsePayload))
        vi.stubGlobal('fetch', limitedFetch)

        await expect(requestUnifiedParse('https://example.com/first')).rejects.toMatchObject({ status: 429 })
        await expect(requestUnifiedParse('https://example.com/second')).rejects.toMatchObject({ status: 429 })
        expect(limitedFetch).toHaveBeenCalledTimes(1)
        now.mockReturnValue(1_010_001)
        await expect(requestUnifiedParse('https://example.com/second')).resolves.toMatchObject({ success: true })
        expect(limitedFetch).toHaveBeenCalledTimes(2)
    })

    it('reloads on the 61st parse attempt before sending another request', async () => {
        for (let index = 0; index < 60; index += 1) {
            await requestUnifiedParse('https://example.com/watch?v=1')
        }

        expect(fetchMock).toHaveBeenCalledTimes(60)

        await expect(requestUnifiedParse('https://example.com/watch?v=1')).rejects.toBeInstanceOf(
            UnifiedParseReloadError
        )

        expect(reload).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledTimes(60)
    })

    it('notifies today stats after a successful parse', async () => {
        await requestUnifiedParse('https://example.com/watch?v=1')

        expect(dispatchEvent).toHaveBeenCalledTimes(1)
        expect(dispatchEvent.mock.calls[0][0]).toBeInstanceOf(CustomEvent)
        expect(dispatchEvent.mock.calls[0][0].type).toBe(TODAY_PARSE_STATS_REFRESH_EVENT)
    })
})
