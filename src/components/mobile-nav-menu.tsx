'use client'

import { useState } from 'react'
import Image from 'next/image'
import { History, Menu, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useDictionary } from '@/i18n/client'
import { DesktopDownloadLink } from '@/components/desktop-download-link'
import { DESKTOP_RELEASES_HISTORY_URL, DESKTOP_REPOSITORY_URL } from '@/lib/desktop-release'

interface MobileNavMenuProps {
    defaultOpen?: boolean
    desktopPage?: boolean
}

export function MobileNavMenu({
    defaultOpen = false,
    desktopPage = false,
}: MobileNavMenuProps) {
    const dict = useDictionary()
    const [open, setOpen] = useState(defaultOpen)

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={dict.page.openMenuLabel}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent
                    showCloseButton={false}
                    aria-describedby={undefined}
                    className="top-auto bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-0 rounded-xl p-4"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>{dict.page.openMenuLabel}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        {!desktopPage && <DesktopDownloadLink source="mobile_menu" onClick={() => setOpen(false)} />}
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <a
                                href={desktopPage ? DESKTOP_REPOSITORY_URL : 'https://github.com/lxw15337674/galaxy-downloader'}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                            >
                                <Image
                                    src="/platform-icons/github.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                    className="dark:invert"
                                />
                                <span>GitHub</span>
                            </a>
                        </Button>
                        {desktopPage && [
                            { href: `${DESKTOP_REPOSITORY_URL}/issues`, label: dict.feedback.triggerButton, icon: MessageSquare },
                            { href: DESKTOP_RELEASES_HISTORY_URL, label: dict.desktopDownload.history, icon: History },
                        ].map(({ href, label, icon: Icon }) => (
                            <Button key={href} variant="outline" className="w-full justify-start" asChild>
                                <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                                    <Icon data-icon="inline-start" aria-hidden="true" />
                                    {label}
                                </a>
                            </Button>
                        ))}
                        <div className="rounded-md border border-border p-1">
                            <ThemeSwitcher fullWidth />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
