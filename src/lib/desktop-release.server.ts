import { unstable_cache } from 'next/cache'
import { DESKTOP_PLATFORMS, type DesktopPlatform, type DesktopRelease } from '@/lib/desktop-release'

const REPOSITORY_URL = 'https://github.com/bhwa233/galaxy-downloader-client'
const ASSET_PATTERNS: Record<DesktopPlatform, RegExp> = {
    windows: /^galaxy-downloader_.+_win_x64\.exe$/,
    macos: /^galaxy-downloader_.+_mac_arm64\.dmg$/,
    linux: /^galaxy-downloader_.+_linux_(?:x64|x86_64)\.AppImage$/,
}

// Reuse the framework cache: only validated releases are stored, and stale
// entries remain available when background revalidation cannot reach GitHub.
export const getLatestDesktopRelease = unstable_cache(async (): Promise<DesktopRelease> => {
    const response = await fetch('https://api.github.com/repos/bhwa233/galaxy-downloader-client/releases/latest', {
        headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'galaxy-downloader',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) throw new Error(`GitHub release request failed: ${response.status}`)

    const release = await response.json() as Record<string, unknown>
    if (release.draft !== false || release.prerelease !== false ||
        typeof release.tag_name !== 'string' || !Array.isArray(release.assets)) {
        throw new Error('Invalid desktop release')
    }

    const downloads: DesktopRelease['downloads'] = {}
    const downloadPrefix = `${REPOSITORY_URL}/releases/download/${encodeURIComponent(release.tag_name)}/`

    for (const item of release.assets) {
        if (!item || typeof item !== 'object') continue
        const asset = item as Record<string, unknown>
        if (typeof asset.name !== 'string' || typeof asset.browser_download_url !== 'string' ||
            typeof asset.size !== 'number' || !Number.isSafeInteger(asset.size) || asset.size <= 0 ||
            asset.state !== 'uploaded' || asset.browser_download_url !== `${downloadPrefix}${encodeURIComponent(asset.name)}`) {
            continue
        }

        const platform = DESKTOP_PLATFORMS.find((value) => ASSET_PATTERNS[value].test(asset.name as string))
        if (platform) {
            downloads[platform] = { name: asset.name, url: asset.browser_download_url, size: asset.size }
        }
    }

    if (Object.keys(downloads).length === 0) throw new Error('Desktop installers are not available')

    return {
        version: release.tag_name.replace(/^v/, ''),
        releaseUrl: `${REPOSITORY_URL}/releases/tag/${encodeURIComponent(release.tag_name)}`,
        downloads,
    }
}, ['desktop-latest-release-v1'], { revalidate: 300 })
