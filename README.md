# 通用媒体下载器

这是一个基于 [vinext](https://github.com/cloudflare/vinext) 运行的 Next.js App Router 兼容项目，支持从 Bilibili、抖音、Instagram、小红书、TikTok、X、Telegram、Threads、微信公众号、微博、Niconico、Vimeo、Dailymotion、Streamable、Reddit、Newgrounds、Tumblr、Pinterest、VK、OK.ru、Twitch、SoundCloud、Apple Podcasts 等平台下载媒体内容。

## 许可证

本项目原创材料采用自定义的 **galaxy-downloader 个人使用及免费公开服务许可证**，完整条款见 [LICENSE](./LICENSE)。这是源码可用许可证，包含商业使用限制，不属于 OSI 定义的开源许可证。

- 允许个人非商业使用、学习、研究及二次开发。
- 允许个人免费向公众提供非商业下载服务，包括服务运行所必需的浏览器客户端文件传输。
- 修改后的源码无需公开；除上述免费公开服务外，修改版仅限本人使用，不得向他人发布修改版的源码、安装包、容器镜像或独立部署包。
- 收费、广告变现、付费会员、商业产品集成，以及用于企业经营或内部业务等商业用途，均须事先取得有权授权的版权人的明确书面授权。商业使用依照单独授权条款进行。
- 保留已有的版权及许可声明。第三方材料遵循各自许可证，不受本项目非商业限制的重新约束。

特别说明：`@ffmpeg/core 0.12.9` 声明采用 `GPL-2.0-or-later`；`@ffmpeg/ffmpeg` 和 `@ffmpeg/util` 采用 MIT 许可证。提供这些组件或其修改版时，仍需履行适用的许可、声明和对应源码提供义务。“修改后的源码无需公开”不豁免第三方许可证的要求。参见 [ffmpeg.wasm 官方许可说明](https://ffmpegwasm.netlify.app/docs/faq/#what-is-the-license-of-ffmpegwasm)。

## 功能特点

- 🖥️ 顶部“下载桌面版”入口，在独立下载中心展示 Windows、macOS、Linux 最新正式版安装包及安装说明
- 🎵 支持 Bilibili 视频/音频下载
- 🎬 支持抖音无水印视频下载及音频提取
- 📱 支持 Instagram Reels、帖子和图文内容下载
- 📷 支持小红书视频笔记和图文笔记下载
- 🎞️ 支持 TikTok 视频下载
- 🐦 支持 X 视频下载
- 🎙️ 支持 Apple Podcasts 公开播客音频，节目页可搜索、选择单集并逐集播放、下载和分享播放链接
- 🌐 支持 Vimeo、Dailymotion、Streamable、Reddit、Newgrounds、Tumblr、Pinterest、VK、OK.ru、Twitch、SoundCloud 等平台内容解析与下载
- 🔍 自动识别平台链接
- 🎨 现代化的用户界面设计
- 💾 本地下载历史记录
- 🌍 多语言支持（简体中文、繁体中文、英文、日文、西班牙文、俄文）

## 开始使用

首先，运行开发服务器：

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3010](http://localhost:3010) 即可看到应用界面。

桌面客户端下载入口的本地验证记录见 [docs/test-links.md](./docs/test-links.md)。

## 使用方法

1. 复制媒体链接（支持首页展示的平台）
2. 粘贴到输入框中
3. 点击解析按钮
4. 选择下载视频、音频或图片
5. 等待下载完成，文件会自动保存

### 支持的链接格式

- **Bilibili**: `https://www.bilibili.com/video/BV...` 或 `https://b23.tv/...`
- **抖音**: `https://www.douyin.com/...` 或 `https://v.douyin.com/...`
- **Instagram**: `https://www.instagram.com/reel/...` 或 `https://www.instagram.com/p/...`
- **小红书**: `https://www.xiaohongshu.com/explore/...` 或 `https://xhslink.com/...`
- **TikTok**: `https://www.tiktok.com/@.../video/...`
- **X**: `https://x.com/.../status/...`
- **Pinterest**: `https://www.pinterest.com/pin/70437485604603/`
- **VK**: `https://vk.com/video-1_456239018`
- **OK.ru**: `https://ok.ru/video/14627121662690`
- **Twitch**: `https://m.twitch.tv/ninja/clip/SuaveNeighborlySrirachaHeyGirl-1J8kzeLFWxdUBZ4C`
- **SoundCloud**: `https://soundcloud.com/forss/flickermood`
- **Apple Podcasts 节目主页**: `https://podcasts.apple.com/tw/podcast/%E9%8C%A2%E5%BE%80%E5%93%AA%E8%A3%A1%E6%B5%81/id1888765575`
- **Apple Podcasts 单集**: 节目链接带 `?i=<episodeId>`，仅展示该集的音频播放与下载

## 技术栈

- vinext
- Next.js 16 App Router API 兼容层
- React 19
- Vite 8
- TypeScript
- Tailwind CSS
- shadcn/ui
- Fetch API（前端网络请求）
- FFmpeg.wasm (浏览器端音频提取)
- JSZip (图片打包下载)

## 当前平台支持

- **Bilibili**: 视频、音频、分享口令
- **Bilibili TV**: 仅音频
- **抖音**: 视频、图文、分享口令
- **Instagram**: Reels、帖子、图文
- **小红书**: 视频、图文
- **TikTok**: 视频
- **X**: 视频
- **Telegram**: 视频
- **Threads**: 视频、图文
- **微信公众号**: 文章视频、多视频
- **微博**: 视频、图文、多视频
- **Niconico**: 视频
- **Vimeo**: 内容下载
- **Dailymotion**: 内容下载
- **Streamable**: 内容下载
- **Reddit**: 内容下载
- - **Newgrounds**: 内容下载
- **Tumblr**: 内容下载
- **Pinterest**: 内容下载
- **VK**: 内容下载
- **OK.ru**: 内容下载
- **Twitch**: 内容下载
- **SoundCloud**: 内容下载
- **Apple Podcasts**: 公开音频；节目主页支持搜索、选择和逐集下载，带 `?i=` 的链接直接展示单集

说明：

- 音频提取目前以浏览器端处理为主，受浏览器性能和文件大小影响
- 图文内容支持按平台返回结果分别下载或打包下载
- Apple Podcasts 仅支持公开可访问的音频，不绕过付费、订阅、地区限制、登录或 DRM；不提供全集压缩包或音频提取操作

## 本地开发

1. 克隆项目
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 运行开发服务器：
   ```bash
   pnpm dev
   ```
4. 生产构建：
   ```bash
   pnpm build
   ```
5. 启动构建产物：
   ```bash
   pnpm start
   ```

## SEO 配置

部署时建议配置以下环境变量，确保公开 API、canonical 和索引策略都正确：

- `NEXT_PUBLIC_API_BASE_URL`: 公开下载 API 地址，例如 `https://downloader-api.bhwa233.com`。前端会直接请求这个地址；本地开发未配置时默认使用 `http://localhost:8788`
- `NEXT_PUBLIC_SITE_URL`: 当前环境站点地址（例如 `https://downloader.bhwa233.com`）
- `SEO_INDEXABLE`: 是否允许索引，`true` / `false`

如果本地开发未配置 `NEXT_PUBLIC_SITE_URL`，应用会默认使用 `http://localhost:3010` 作为站点基址，避免 manifest、canonical 和 Open Graph 链接错误地指向生产域名。

如果生产或预发环境需要接入非默认公开 API，请显式配置 `NEXT_PUBLIC_API_BASE_URL`，避免客户端请求落到错误的域名。

默认策略：

- 在 Vercel 生产环境自动允许索引
- 在 Vercel 预览环境默认不允许索引
- 非 Vercel 环境按 `NODE_ENV === production` 判断是否允许索引
- 可通过 `SEO_INDEXABLE` 显式覆盖

## SEO 监控建议

建议每周检查以下指标，持续验证本仓库内的 SEO 配置是否生效：

1. Search Console 的 `索引页面` 与 `未编入索引原因`
2. `sitemap.xml` 提交状态与抓取成功率
3. Core Web Vitals（LCP、INP、CLS）趋势
4. 重点页面（首页、FAQ、Guides）的展示量与点击量
5. 多语言页面的 `hreflang` 与 canonical 是否一致

## 部署

默认使用 `vinext` 生成 `dist/` 构建产物。部署前请先执行：

```bash
pnpm build
```

Cloudflare Workers 部署请使用：

```bash
pnpm deploy
```

部署脚本会只针对 Cloudflare API 的 `971` 限流错误自动退避重试（默认间隔为 60、120、180 秒）。其他错误会立即失败，避免掩盖配置或构建问题。可通过 `CF_DEPLOY_MAX_ATTEMPTS` 和 `CF_DEPLOY_RETRY_DELAY_MS` 调整重试次数和基础等待时间。

如果平台已经先执行过 `pnpm build`，部署命令请改为：

```bash
pnpm deploy:ci
```

预览部署可使用：

```bash
pnpm deploy:preview
```

不要直接使用 `wrangler deploy` 作为部署命令。当前项目基于 `vinext`，应由 `vinext deploy` 负责生成所需配置、构建并调用 Wrangler。
