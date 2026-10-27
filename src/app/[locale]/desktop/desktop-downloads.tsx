'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Check, Download, FolderDown, Layers3, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppLocale, useDictionary } from '@/i18n/client'
import { DESKTOP_PLATFORMS, type DesktopPlatform, type DesktopRelease } from '@/lib/desktop-release'
import { cn, formatBytes } from '@/lib/utils'

const PLATFORM_DETAILS = {
    windows: { name: 'Windows', architecture: 'x64', format: '.exe', icon: '/system-icons/windows.svg' },
    macos: { name: 'macOS', architecture: 'Apple Silicon', format: '.dmg', icon: '/system-icons/apple.svg' },
    linux: { name: 'Linux', architecture: 'x64 / x86_64', format: 'AppImage', icon: '/system-icons/linux.svg' },
} as const

// The browser platform stays fixed for the lifetime of the page.
function subscribeToPlatform() {
    return () => {}
}

function getDesktopPlatform(): DesktopPlatform | undefined {
    const ua = navigator.userAgent
    if (/Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return undefined
    if (/Windows/i.test(ua)) return 'windows'
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macos'
    if (/Linux/i.test(ua)) return 'linux'
    return undefined
}

function getServerPlatform() {
    return undefined
}

function trackEvent(name: 'desktop_download_open' | 'desktop_download_click', params: Record<string, string>) {
    const sourceParam = new URLSearchParams(window.location.search).get('source')
    const source = sourceParam === 'top_bar' || sourceParam === 'mobile_menu' ? sourceParam : 'direct'
    const analytics = window as Window & { gtag?: (command: 'event', name: string, params: Record<string, string>) => void }
    analytics.gtag?.('event', name, { ...params, source })
}

export function DesktopDownloads({ initialRelease }: { initialRelease: DesktopRelease | null }) {
    const dict = useDictionary().desktopDownload
    const locale = useAppLocale()
    const platform = useSyncExternalStore(subscribeToPlatform, getDesktopPlatform, getServerPlatform)
    const [release, setRelease] = useState(initialRelease)
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(initialRelease === null)
    const [attempt, setAttempt] = useState(0)
    const benefits = [
        { icon: FolderDown, ...dict.benefits.local },
        { icon: Layers3, ...dict.benefits.batch },
        { icon: ShieldCheck, ...dict.benefits.ready },
    ]

    useEffect(() => {
        trackEvent('desktop_download_open', { locale })
    }, [locale])

    useEffect(() => {
        // Initial installers are rendered by the server; fetch only on an explicit retry.
        if (attempt === 0) return
        const controller = new AbortController()
        let cancelled = false
        const timeout = window.setTimeout(() => controller.abort(), 12_000)
        fetch('/api/desktop-release', { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error('Release unavailable')
                return response.json() as Promise<DesktopRelease>
            })
            .then((data) => { if (!cancelled) setRelease(data) })
            .catch(() => { if (!cancelled) setFailed(true) })
            .finally(() => {
                window.clearTimeout(timeout)
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
            window.clearTimeout(timeout)
            controller.abort()
        }
    }, [attempt])

    return (
        <main className="flex flex-1 flex-col bg-muted/20 px-3 sm:px-4">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-10">
                <header className="flex justify-center text-center">
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-4xl">{dict.pageTitle}</h1>
                        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
                            {release ? (
                                <><Badge variant="secondary">v{release.version}</Badge><span className="sr-only sm:not-sr-only">{dict.latestVersion}</span></>
                            ) : loading ? (
                                <><LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /><span>{dict.loading}</span></>
                            ) : null}
                        </div>
                    </div>
                </header>

                {failed && (
                    <div className="flex flex-wrap items-center gap-3" role="status">
                        <p className="text-sm text-muted-foreground">{release ? dict.cachedRelease : dict.loadFailed}</p>
                        <Button variant="outline" size="sm" disabled={loading} onClick={() => {
                            setLoading(true)
                            setFailed(false)
                            setAttempt((value) => value + 1)
                        }}>
                            <RefreshCw data-icon="inline-start" aria-hidden="true" />{dict.retry}
                        </Button>
                    </div>
                )}

                <section className="grid gap-4 lg:grid-cols-3">
                    {benefits.map(({ icon: Icon, title, description }) => (
                        <Card key={title} className="shadow-none">
                            <CardHeader className="p-5 pb-3">
                                <div className="flex items-center gap-3">
                                    <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <CardTitle><h2>{title}</h2></CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <CardDescription className="leading-relaxed">{description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid items-stretch gap-4 lg:grid-cols-3" aria-label={dict.systemLabel}>
                    {DESKTOP_PLATFORMS.map((value) => {
                        const { name, architecture, format, icon } = PLATFORM_DETAILS[value]
                        const copy = dict.platforms[value]
                        const download = release?.downloads[value]
                        const isCurrent = platform === value

                        return (
                            <Card key={value} className={cn('flex flex-col rounded-2xl shadow-none', isCurrent && 'border-foreground/50 ring-1 ring-foreground/10')}>
                                <CardHeader className="gap-5 p-6">
                                    <div className="flex min-h-12 items-start justify-between gap-2">
                                        <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/50">
                                            <span
                                                className="size-6 bg-foreground"
                                                style={{ mask: `url(${icon}) center / contain no-repeat` }}
                                                aria-hidden="true"
                                            />
                                        </div>
                                        {isCurrent && <Badge variant="secondary"><Check className="mr-1 size-3" aria-hidden="true" />{dict.currentSystem}</Badge>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <CardTitle><h2>{name}</h2></CardTitle>
                                        <CardDescription>{architecture}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-5 px-6 pb-5 pt-0">
                                    <p className="min-h-12 text-xs leading-6 text-muted-foreground">{copy.requirements}</p>
                                    <div className="flex flex-col gap-3">
                                        <p className="flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-mono">{format}</span>
                                            {download ? <><span aria-hidden="true">·</span><span>{formatBytes(download.size)}</span></> : null}
                                        </p>
                                        {download ? (
                                            <Button size="lg" variant={isCurrent ? 'default' : 'outline'} className="w-full" asChild>
                                                <a href={download.url} onClick={() => trackEvent('desktop_download_click', { locale, platform: value, version: release!.version })}>
                                                    <Download data-icon="inline-start" aria-hidden="true" />{copy.download}
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button size="lg" variant="outline" className="w-full" disabled>
                                                {loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Download data-icon="inline-start" aria-hidden="true" />}
                                                {loading ? dict.loading : copy.download}
                                            </Button>
                                        )}
                                        {release && !download && <p className="text-xs leading-relaxed text-muted-foreground">{dict.unavailable}</p>}
                                        <p className="min-h-10 text-xs leading-5 text-muted-foreground">{copy.installHint}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-3 px-6 pb-6 pt-0">
                                    <h3 className="text-xs font-medium">{dict.installation}</h3>
                                    <ol className="flex list-decimal flex-col gap-2 pl-4 text-xs leading-6 text-muted-foreground">
                                        {copy.steps.map((step) => <li key={step}>{step}</li>)}
                                    </ol>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </section>

            </div>
        </main>
    )
}
