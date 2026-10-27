import { getLatestDesktopRelease } from '@/lib/desktop-release.server'

export async function GET() {
    try {
        const release = await getLatestDesktopRelease()
        return Response.json(release, {
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400' },
        })
    } catch (error) {
        console.error('[desktop-release]', error instanceof Error ? error.message : 'Release lookup failed')
        return Response.json({ error: 'release_unavailable' }, {
            status: 503,
            headers: { 'Cache-Control': 'no-store' },
        })
    }
}
