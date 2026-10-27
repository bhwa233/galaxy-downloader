'use client'

import Link from 'next/link'
import { MonitorDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppLocale, useDictionary } from '@/i18n/client'

interface DesktopDownloadLinkProps {
    source: 'top_bar' | 'mobile_menu'
    onClick?: () => void
}

export function DesktopDownloadLink({ source, onClick }: DesktopDownloadLinkProps) {
    const locale = useAppLocale()
    const dict = useDictionary().desktopDownload

    return (
        <Button size={source === 'top_bar' ? 'sm' : 'default'} className={source === 'mobile_menu' ? 'w-full justify-start' : undefined} asChild>
            <Link href={`/${locale}/desktop?source=${source}`} target="_blank" rel="noopener noreferrer" onClick={onClick}>
                <MonitorDown data-icon="inline-start" aria-hidden="true" />
                {dict.trigger}
            </Link>
        </Button>
    )
}
