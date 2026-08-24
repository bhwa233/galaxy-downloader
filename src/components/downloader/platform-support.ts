import type { Dictionary } from '@/lib/i18n/types';

export type PlatformSupportKey =
    | 'bilibili'
    | 'douyin'
    | 'vimeo'
    | 'dailymotion'
    | 'streamable'
    | 'reddit'
    | 'tumblr'
    | 'pinterest'
    | 'vk'
    | 'okru'
    | 'twitch'
    | 'soundcloud'
    | 'applePodcasts'
    | 'instagram'
    | 'kuaishou'
    | 'niconico'
    | 'telegram'
    | 'threads'
    | 'wechat'
    | 'weibo'
    | 'xiaohongshu'
    | 'youtube'
    | 'zhihu'
    | 'generic'
    | 'tiktok'
    | 'x'
    | 'bluesky'
    | 'rumble'
    | 'snapchat'
    | 'coub'
    | 'imgur'
    | 'odysee'
    | 'rutube';

type PlatformSupportVisual = {
    src?: string;
    darkSrc?: string;
    fallbackLabel?: string;
    frameClassName: string;
    iconClassName?: string;
    badgeLabel?: string;
    badgeClassName?: string;
};

export type PlatformSupportItem = {
    key: PlatformSupportKey;
    name: string;
    visual: PlatformSupportVisual;
};

type PlatformSupportDictionary = Pick<Dictionary, 'guide'>;

const UNIFIED_FRAME_CLASS_NAME = 'border-slate-200 bg-slate-100/70 dark:border-slate-300/40 dark:bg-slate-800/45';

const PLATFORM_SUPPORT_VISUALS: Record<PlatformSupportKey, PlatformSupportVisual> = {
    bilibili: { src: '/platform-icons/bilibili.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    douyin: { src: '/platform-icons/douyin.ico', frameClassName: UNIFIED_FRAME_CLASS_NAME, iconClassName: 'rounded-sm' },
    vimeo: { src: '/platform-icons/vimeo.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    dailymotion: { src: '/platform-icons/dailymotion.svg', darkSrc: '/platform-icons/dailymotion-dark.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    streamable: { src: '/platform-icons/streamable.png', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    reddit: { src: '/platform-icons/reddit.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    tumblr: { src: '/platform-icons/tumblr.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    pinterest: { src: '/platform-icons/pinterest.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    vk: { src: '/platform-icons/vk.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    okru: { src: '/platform-icons/okru.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    twitch: { src: '/platform-icons/twitch.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    soundcloud: { src: '/platform-icons/soundcloud.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    applePodcasts: { src: '/platform-icons/apple-podcasts.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    instagram: { src: '/platform-icons/instagram.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    kuaishou: { src: '/platform-icons/kuaishou.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    niconico: { src: '/platform-icons/niconico.svg', darkSrc: '/platform-icons/niconico-dark.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    telegram: { src: '/platform-icons/telegram.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    threads: { src: '/platform-icons/threads.svg', darkSrc: '/platform-icons/threads-dark.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    wechat: { src: '/platform-icons/wechat.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    weibo: { src: '/platform-icons/weibo.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    xiaohongshu: { src: '/platform-icons/xiaohongshu.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    youtube: { src: '/platform-icons/youtube.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    zhihu: { src: '/platform-icons/zhihu.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    generic: { fallbackLabel: 'WEB', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    tiktok: { src: '/platform-icons/tiktok.svg', darkSrc: '/platform-icons/tiktok-dark.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    x: { src: '/platform-icons/x.svg', darkSrc: '/platform-icons/x-dark.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    bluesky: { src: '/platform-icons/bluesky.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    rumble: { src: '/platform-icons/rumble.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    snapchat: { src: '/platform-icons/snapchat.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    coub: { src: '/platform-icons/coub.ico', frameClassName: UNIFIED_FRAME_CLASS_NAME, iconClassName: 'rounded-sm' },
    imgur: { src: '/platform-icons/imgur.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    odysee: { src: '/platform-icons/odysee.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
    rutube: { src: '/platform-icons/rutube.svg', frameClassName: UNIFIED_FRAME_CLASS_NAME },
};

const PLATFORM_SUPPORT_CATALOG: PlatformSupportKey[] = [
    'bilibili', 'douyin', 'generic', 'youtube', 'telegram',
    'threads', 'wechat', 'niconico', 'weibo', 'xiaohongshu', 'tiktok',
    'instagram', 'x', 'vimeo', 'dailymotion', 'streamable', 'reddit',
    'tumblr', 'pinterest', 'vk', 'okru', 'twitch', 'soundcloud',
    'applePodcasts', 'kuaishou', 'zhihu', 'bluesky', 'rumble', 'snapchat',
    'coub', 'imgur', 'odysee', 'rutube',
];

function getEntry(dict: PlatformSupportDictionary, key: PlatformSupportKey) {
    return dict.guide.platformSupport[key];
}

export function getPlatformSupportItems(dict: PlatformSupportDictionary): PlatformSupportItem[] {
    return PLATFORM_SUPPORT_CATALOG.map((key) => ({
        key,
        name: getEntry(dict, key).name,
        visual: PLATFORM_SUPPORT_VISUALS[key],
    }));
}
