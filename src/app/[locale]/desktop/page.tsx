import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { buildLanguageAlternates, buildLocaleUrl } from '@/lib/seo'
import { getLatestDesktopRelease } from '@/lib/desktop-release.server'
import { DesktopDownloads } from './desktop-downloads'

export async function generateMetadata({ params }: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const { desktopDownload: dict } = await getMessages({ locale }) as Dictionary
    const title = dict.pageTitle
    const description = dict.description

    return {
        title,
        description,
        alternates: {
            canonical: buildLocaleUrl(locale, '/desktop'),
            languages: buildLanguageAlternates('/desktop'),
        },
        openGraph: { title, description, url: buildLocaleUrl(locale, '/desktop') },
        twitter: { title, description },
    }
}

export default async function DesktopPage() {
    const initialRelease = await getLatestDesktopRelease().catch((error) => {
        console.error('[desktop-release]', error instanceof Error ? error.message : 'Release lookup failed')
        return null
    })

    return <DesktopDownloads initialRelease={initialRelease} />
}
