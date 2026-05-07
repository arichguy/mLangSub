<div align="center">

# 🎬 mLangSub

**多语言在线视频字幕下载工具**

从 YouTube、Bilibili、Viki 等 50+ 视频平台一键提取多语言字幕

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[功能特性](#-功能特性) · [在线演示](#-在线演示) · [快速开始](#-快速开始) · [部署指南](#-部署指南) · [技术架构](#-技术架构) · [API 文档](#-api-文档)

</div>

---

## ✨ 功能特性

### 🌐 多平台支持

支持 50+ 主流视频网站，覆盖全球主要视频平台：

| 平台类型 | 支持网站 |
|----------|----------|
| 国际视频 | YouTube、Dailymotion、Vimeo、Twitch |
| 亚洲视频 | Bilibili、Viki、iQiyi、WeTV、Hotstar、Viu |
| 短视频 | TikTok、YouTube Shorts |
| 直播回放 | Twitch VOD、YouTube Live |

> 完整支持列表取决于 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 支持的平台，持续更新中。

### 📝 字幕格式

| 格式 | 说明 | 适用场景 |
|------|------|----------|
| SRT | 通用字幕格式 | 所有播放器 |
| VTT | Web 字幕格式 | 网页播放器 |
| ASS | 高级字幕格式 | 动画/特效字幕 |
| TXT | 纯文本字幕 | 阅读和翻译 |

### 🌍 双语字幕

- 任意两种语言字幕合并导出
- 支持手动字幕 + 自动生成字幕的组合
- 适合语言学习和跨语言内容消费

### 🛡️ 反限流机制

采用三级降级策略确保字幕提取成功率：

```
yt-dlp（主方案）→ YouTube Data API（备选）→ Playwright 浏览器模拟（兜底）
```

内置反限流模块：
- **代理池轮转** — 自动切换代理 IP，避免单 IP 请求限制
- **Cookie 管理** — 数据库存储平台 Cookie，模拟登录状态
- **请求轮转** — 随机化请求间隔和 User-Agent
- **指数退避重试** — 智能重试策略，避免触发风控

### 📊 管理面板

- 访问统计与趋势图表
- 缓存命中率监控
- 缓存管理（查看/清理）
- 系统配置管理
- 访问日志查询

### 🌐 多语言界面

支持 5 种界面语言：中文、English、日本語、한국어、Español

---

## 🚀 在线演示

访问 `http://你的域名` 即可使用。

管理面板地址：`http://你的域名/admin`

---

## 📦 快速开始

### 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 20+ | 运行 Next.js 应用 |
| Python | 3.8+ | 运行 yt-dlp |
| PostgreSQL | 14+ | 数据存储 |
| Redis | 6+ | 缓存加速 |
| yt-dlp | 最新版 | 字幕提取核心 |

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/arichguy/mLangSub.git
cd mLangSub

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库和 Redis 连接信息

# 4. 安装 yt-dlp（字幕提取核心工具）
python3 -m pip install -U yt-dlp

# 5. 初始化数据库
npx prisma db push
npm run db:seed

# 6. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

### Docker 一键启动（最简单）

```bash
# 克隆仓库
git clone https://github.com/arichguy/mLangSub.git
cd mLangSub

# 配置环境变量
cp .env.example .env
# 编辑 .env 修改 JWT_SECRET 和数据库密码

# 同步修改 docker-compose.yml 中的密码
# 启动所有服务（PostgreSQL + Redis + 应用）
docker compose up -d --build

# 初始化数据库
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

访问 http://localhost:3000 即可使用。

---

## 🚢 部署指南

提供三种部署方案，适合不同技术水平的用户：

| 方案 | 难度 | 适合人群 | 说明 |
|------|------|----------|------|
| Docker 部署 | ⭐ | 所有人（推荐） | 一条命令启动，所有依赖打包在容器中 |
| 宝塔面板部署 | ⭐⭐ | 不熟悉命令行 | 图形化界面操作 |
| 手动上传部署 | ⭐⭐⭐ | 无法使用 Git | 通过 FTP 上传文件，手动安装依赖 |

👉 **详细部署步骤请阅读 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**，包含每一步操作指令和验证方法。

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | React 全栈框架，SSR/SSG 支持 |
| 类型系统 | TypeScript 5.4 | 全栈类型安全 |
| 样式方案 | Tailwind CSS 3.4 | 原子化 CSS，快速开发 |
| UI 组件 | Lucide React + CVA | 轻量级图标 + 变体组件 |
| 后端框架 | Next.js API Routes | 服务端 API，无需独立后端 |
| ORM | Prisma 5 | 类型安全的数据库操作 |
| 数据库 | PostgreSQL 16 | 可靠的关系型数据库 |
| 缓存 | Redis 7 | 高性能内存缓存 |
| 字幕提取 | yt-dlp | 支持 1000+ 视频网站 |
| 浏览器模拟 | Playwright | 无头浏览器兜底方案 |
| 图表 | Recharts | 管理面板数据可视化 |

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx 反向代理                         │
│                  (SSL 终止 / 负载均衡)                    │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               Next.js 应用 (Port 3000)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  前端页面  │  │ API 路由  │  │  中间件   │              │
│  │ (React)  │  │(REST API)│  │(安全/限流) │              │
│  └──────────┘  └────┬─────┘  └──────────┘              │
│                      │                                    │
│  ┌───────────────────▼──────────────────────┐           │
│  │           字幕提取调度器 (Extractor)        │           │
│  │                                           │           │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │           │
│  │  │ yt-dlp  │→ │ Platform │→ │Playwright│ │           │
│  │  │ (主方案) │  │   API    │  │ (兜底)   │ │           │
│  │  └─────────┘  └──────────┘  └─────────┘ │           │
│  └───────────────────┬──────────────────────┘           │
│                      │                                    │
│  ┌───────────────────▼──────────────────────┐           │
│  │            三级缓存系统                     │           │
│  │  Redis (L1, 24h) → PostgreSQL (L2, 7d)   │           │
│  └──────────────────────────────────────────┘           │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Redis   │ │  文件系统  │
        │  (数据)   │ │ (缓存)   │ │(字幕文件) │
        └──────────┘ └──────────┘ └──────────┘
```

### 字幕提取流程

```
用户输入视频 URL
       │
       ▼
  URL 验证与解析 ──→ 识别平台和视频 ID
       │
       ▼
  检查缓存 ──→ 命中缓存 ──→ 直接返回
       │
       未命中
       │
       ▼
  ┌─────────────────────────────────────┐
  │        三级降级提取策略               │
  │                                     │
  │  Level 1: yt-dlp                    │
  │  ├─ 使用代理池轮转 IP               │
  │  ├─ 使用 Cookie 模拟登录            │
  │  └─ 内置反限流参数                  │
  │       │                             │
  │       失败 ↓                        │
  │                                     │
  │  Level 2: 平台官方 API              │
  │  ├─ YouTube Data API v3            │
  │  └─ YouTube timedtext API          │
  │       │                             │
  │       失败 ↓                        │
  │                                     │
  │  Level 3: Playwright 浏览器模拟     │
  │  ├─ 无头 Chromium 浏览器            │
  │  ├─ 反检测脚本注入                  │
  │  └─ 随机视口和指纹                  │
  └─────────────────────────────────────┘
       │
       ▼
  格式转换 (VTT → SRT/ASS/TXT)
       │
       ▼
  写入缓存 (Redis + PostgreSQL)
       │
       ▼
  返回字幕内容
```

### 数据库模型

```
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  AccessLog   │  │  SubtitleCache   │  │  VideoInfoCache  │
├──────────────┤  ├──────────────────┤  ├──────────────────┤
│ id           │  │ id               │  │ id               │
│ ip           │  │ videoId          │  │ videoId          │
│ country      │  │ platform         │  │ platform         │
│ userAgent    │  │ videoUrl         │  │ title            │
│ videoUrl     │  │ language         │  │ author           │
│ platform     │  │ subtitleType     │  │ duration         │
│ action       │  │ format           │  │ thumbnail        │
│ subtitleLang │  │ content          │  │ uploadDate       │
│ cacheHit     │  │ fileSize         │  │ description      │
│ createdAt    │  │ hitCount         │  │ expiresAt        │
└──────────────┘  │ expiresAt        │  └──────────────────┘
                  └──────────────────┘
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Admin      │  │  SystemConfig    │  │   ProxyNode      │
├──────────────┤  ├──────────────────┤  ├──────────────────┤
│ id           │  │ id               │  │ id               │
│ username     │  │ key              │  │ host             │
│ password     │  │ value            │  │ port             │
│ role         │  └──────────────────┘  │ protocol         │
│ createdAt    │                        │ username         │
└──────────────┘  ┌──────────────────┐  │ password         │
                  │  CookieStore     │  │ country          │
                  ├──────────────────┤  │ isActive         │
                  │ id               │  │ failCount        │
                  │ platform         │  └──────────────────┘
                  │ cookies          │
                  │ isActive         │
                  └──────────────────┘
```

---

## 📡 API 文档

### 分析视频字幕

```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**响应示例：**

```json
{
  "success": true,
  "videoInfo": {
    "videoId": "VIDEO_ID",
    "platform": "youtube",
    "title": "视频标题",
    "author": "频道名称",
    "duration": 600,
    "thumbnail": "https://..."
  },
  "ccSubtitles": [
    {
      "langCode": "en",
      "langName": "English",
      "isAutoGenerated": false,
      "isTranslation": false
    }
  ],
  "autoTranslated": [
    {
      "langCode": "zh-Hans",
      "langName": "中文（简体）(自动)",
      "isAutoGenerated": true,
      "isTranslation": true
    }
  ],
  "hasVoice": true,
  "csrf": "csrf-token"
}
```

### 下载字幕

```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "langCode": "en",
  "format": "srt",
  "subtitleType": "cc",
  "csrf": "csrf-token"
}
```

**响应：** 返回字幕文件内容（纯文本）

### 双语字幕

```http
POST /api/bilingual
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "firstLangCode": "en",
  "secondLangCode": "zh-Hans",
  "format": "srt",
  "csrf": "csrf-token"
}
```

**响应：** 返回双语合并后的字幕文件内容

### 视频信息

```http
POST /api/video-info
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### 管理面板 API

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/admin/stats` | GET | 获取访问统计 |
| `/api/admin/cache` | GET | 获取缓存统计 |
| `/api/admin/cache` | DELETE | 清理过期缓存 |
| `/api/admin/users` | GET | 获取访问日志 |

> 管理面板 API 需要管理员登录后获取 JWT Token，在请求头中携带 `Authorization: Bearer <token>`。

---

## ⚙️ 环境变量

| 变量名 | 说明 | 默认值 | 必须 |
|--------|------|--------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | — | ✅ |
| `REDIS_URL` | Redis 连接字符串 | `redis://localhost:6379` | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | — | ✅ |
| `NEXT_PUBLIC_APP_URL` | 应用对外访问地址 | `http://localhost:3000` | ✅ |
| `NEXT_PUBLIC_APP_NAME` | 应用显示名称 | `mLangSub` | ❌ |
| `YOUTUBE_API_KEY` | YouTube Data API v3 密钥 | — | ❌ |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | ❌ |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` | ⚠️ 建议修改 |
| `SUBTITLE_STORAGE_PATH` | 字幕文件存储路径 | `./data/subtitles` | ❌ |
| `RATE_LIMIT_IP_PER_MIN` | 每 IP 每分钟请求限制 | `60` | ❌ |
| `RATE_LIMIT_GLOBAL_PER_MIN` | 全局每分钟请求限制 | `1000` | ❌ |

> ⚠️ 生产环境必须修改 `JWT_SECRET` 和 `ADMIN_PASSWORD`，否则应用将拒绝启动或存在安全风险。

---

## 📁 项目结构

```
mLangSub/
├── prisma/                     # 数据库 Schema
│   └── schema.prisma           # 数据模型定义（7 个模型）
├── public/
│   ├── images/                 # 静态图片
│   └── locales/                # 国际化翻译文件（5 种语言）
│       ├── zh-CN.json
│       ├── en.json
│       ├── ja.json
│       ├── ko.json
│       └── es.json
├── scripts/
│   ├── seed-db.ts              # 数据库初始化脚本
│   ├── setup-ytdlp.sh          # yt-dlp 安装脚本
│   └── setup-playwright.sh     # Playwright 安装脚本
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首页
│   │   ├── layout.tsx          # 根布局
│   │   ├── globals.css         # 全局样式
│   │   ├── [platform]/         # SEO 落地页
│   │   ├── admin/              # 管理面板
│   │   │   ├── page.tsx        # 管理面板主页
│   │   │   └── login/          # 管理员登录
│   │   ├── api/                # API 路由
│   │   │   ├── analyze/        # 视频分析
│   │   │   ├── download/       # 字幕下载
│   │   │   ├── bilingual/      # 双语字幕
│   │   │   ├── video-info/     # 视频信息
│   │   │   └── admin/          # 管理接口
│   │   ├── robots.txt/         # SEO robots
│   │   └── sitemap.xml/        # SEO 站点地图
│   ├── components/
│   │   ├── home/               # 首页组件
│   │   │   ├── UrlInput.tsx    # URL 输入框
│   │   │   ├── SubtitleList.tsx# 字幕列表
│   │   │   ├── SubtitleItem.tsx# 字幕项
│   │   │   ├── VideoInfo.tsx   # 视频信息卡片
│   │   │   ├── BilingualSelector.tsx # 双语选择器
│   │   │   ├── FormatSelector.tsx    # 格式选择器
│   │   │   ├── ProgressBar.tsx       # 进度条
│   │   │   └── PlatformSEOContent.tsx# SEO 内容
│   │   ├── admin/              # 管理面板组件
│   │   │   ├── Dashboard.tsx   # 仪表盘
│   │   │   ├── AccessLog.tsx   # 访问日志
│   │   │   ├── CacheManager.tsx# 缓存管理
│   │   │   └── StatsChart.tsx  # 统计图表
│   │   └── layout/             # 布局组件
│   │       ├── Header.tsx      # 顶部导航
│   │       └── Footer.tsx      # 底部信息
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAnalyze.ts       # 视频分析 Hook
│   │   ├── useDownload.ts      # 字幕下载 Hook
│   │   └── useProgress.ts      # 进度管理 Hook
│   ├── lib/                    # 核心业务库
│   │   ├── subtitle/           # 字幕处理核心
│   │   │   ├── extractor.ts    # 提取调度器（三级降级）
│   │   │   ├── ytdlp.ts        # yt-dlp 集成
│   │   │   ├── api.ts          # YouTube Data API
│   │   │   ├── browser.ts      # Playwright 浏览器模拟
│   │   │   ├── converter.ts    # 格式转换器（SRT/VTT/ASS/TXT）
│   │   │   ├── bilingual.ts    # 双语字幕合并
│   │   │   ├── cache.ts        # 三级缓存（Redis → PostgreSQL）
│   │   │   └── cookies-file.ts # Cookie 文件管理
│   │   ├── platform/           # 平台适配器
│   │   │   ├── youtube.ts      # YouTube 适配器
│   │   │   ├── bilibili.ts     # Bilibili 适配器
│   │   │   └── viki.ts         # Viki 适配器
│   │   ├── anti-limit/         # 反限流模块
│   │   │   ├── proxy-pool.ts   # 代理池管理
│   │   │   ├── cookie-manager.ts# Cookie 管理
│   │   │   ├── rotator.ts      # 请求轮转
│   │   │   └── rate-limiter.ts # 限流器
│   │   ├── security/           # 安全模块
│   │   │   ├── auth.ts         # JWT 认证
│   │   │   ├── csrf.ts         # CSRF 防护
│   │   │   ├── rate-limit.ts   # 请求限流
│   │   │   └── sanitizer.ts    # 输入净化
│   │   ├── db/                 # 数据库
│   │   │   └── index.ts        # Prisma 客户端
│   │   ├── video/              # 视频处理
│   │   │   ├── validator.ts    # URL 验证
│   │   │   ├── parser.ts       # URL 解析
│   │   │   └── info.ts         # 视频信息缓存
│   │   ├── seo/                # SEO 模块
│   │   │   ├── metadata.ts     # 元数据生成
│   │   │   └── sitemap.ts      # 站点地图生成
│   │   ├── i18n/               # 国际化
│   │   │   └── config.ts       # 语言配置
│   │   └── utils.ts            # 工具函数
│   ├── types/                  # TypeScript 类型
│   │   ├── api.ts              # API 类型
│   │   ├── subtitle.ts         # 字幕类型
│   │   └── video.ts            # 视频类型
│   └── middleware.ts           # Next.js 中间件（安全头/限流）
├── .env.example                # 环境变量模板
├── Dockerfile                  # Docker 镜像定义
├── docker-compose.yml          # Docker Compose 编排
├── next.config.mjs             # Next.js 配置
├── package.json                # 项目依赖
├── tailwind.config.ts          # Tailwind CSS 配置
└── tsconfig.json               # TypeScript 配置
```

---

## 🛠️ 开发

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 推送数据库 Schema |
| `npm run db:migrate` | 运行数据库迁移 |
| `npm run db:seed` | 初始化数据库（创建管理员和默认配置） |

### 代码规范

- **TypeScript 严格模式** — 全栈类型安全，前后端类型共享
- **ESLint** — 代码风格统一
- **Prisma ORM** — 类型安全的数据库操作
- **中间件架构** — 安全头、限流、CSRF 防护统一处理

---

## 🔒 安全特性

| 特性 | 说明 |
|------|------|
| JWT 认证 | 管理面板使用 JWT Token 认证，生产环境强制要求安全密钥 |
| CSRF 防护 | 写操作 API 需要 CSRF Token 验证 |
| 请求限流 | IP 级别 + 全局级别双重限流，防止滥用 |
| 输入净化 | URL 参数严格验证，防止注入攻击 |
| 安全头 | X-Frame-Options、CSP、X-Content-Type-Options 等安全响应头 |
| 密码加密 | 管理员密码使用 bcrypt 哈希存储 |

---

## ❓ 常见问题

<details>
<summary><strong>字幕提取失败怎么办？</strong></summary>

1. 首先确认 yt-dlp 是最新版本：`python3 -m pip install -U yt-dlp`
2. 某些视频可能没有字幕（手动或自动生成的都没有）
3. YouTube 等平台可能临时限制访问，稍后重试
4. 如果经常被限制，考虑配置代理池（在管理面板中添加代理节点）
</details>

<details>
<summary><strong>如何添加代理节点？</strong></summary>

在管理面板中可以添加代理节点到 ProxyNode 表，系统会自动轮转使用这些代理。支持 HTTP/HTTPS/SOCKS5 代理。
</details>

<details>
<summary><strong>如何更新 yt-dlp？</strong></summary>

yt-dlp 需要经常更新以适配视频网站的变化，建议每周更新：

```bash
python3 -m pip install -U yt-dlp
```

Docker 环境：

```bash
docker compose exec app python3 -m pip install -U yt-dlp
```
</details>

<details>
<summary><strong>支持哪些视频平台？</strong></summary>

底层使用 yt-dlp 提取字幕，理论上支持 yt-dlp 支持的所有平台（1000+ 网站）。对于 YouTube、Bilibili、Viki 等主流平台，还额外开发了专用适配器以提高提取成功率。
</details>

<details>
<summary><strong>Playwright 是必须安装的吗？</strong></summary>

不是必须的。Playwright 是浏览器兜底方案，仅当 yt-dlp 和平台 API 都无法提取字幕时才会使用。如果不安装，系统会跳过浏览器方案，直接返回提取失败。建议在生产环境安装以提高成功率。
</details>

---

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

</div>
