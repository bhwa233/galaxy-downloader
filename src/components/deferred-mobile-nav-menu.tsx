'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDictionary } from '@/i18n/client'

const MobileNavMenu = dynamic(
    () => import('@/components/mobile-nav-menu').then((m) => m.MobileNavMenu),
    { ssr: false }
)

export function DeferredMobileNavMenu({ desktopPage = false }: { desktopPage?: boolean }) {
    const dict = useDictionary()
    const [mounted, setMounted] = useState(false)

    if (mounted) {
        return <MobileNavMenu defaultOpen desktopPage={desktopPage} />
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setMounted(true)}
            aria-label={dict.page.openMenuLabel}
        >
            <Menu className="h-5 w-5" />
        </Button>
    )
}
