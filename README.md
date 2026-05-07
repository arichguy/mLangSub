# mLangSub

多语言在线视频字幕下载工具，支持 YouTube、Bilibili、Viki 等 50+ 平台的字幕提取与下载。

## 功能

- **多平台支持** — YouTube、Bilibili、Viki、Dailymotion、iQiyi、WeTV、Hotstar、Viu、TikTok、Twitch 等 50+ 视频网站
- **多格式下载** — SRT、VTT、TXT、ASS
- **双语字幕** — 任意两种语言字幕合并导出
- **多语言界面** — 中文、English、日本語、한국어、Español
- **管理面板** — 下载统计、缓存管理、系统监控

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| UI 组件 | shadcn/ui + Radix UI |
| 后端 | Next.js API Routes |
| 字幕提取 | yt-dlp + Playwright |
| 数据库 | PostgreSQL + Prisma ORM |
| 缓存 | Redis |
| 图表 | Recharts |

## 快速开始

### 环境要求

- Node.js 20+
- Python 3 + yt-dlp
- PostgreSQL
- Redis

### 安装

```bash
# 克隆仓库
git clone https://github.com/arichguy/mLangSub.git
cd mLangSub

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库和 Redis 连接信息

# 初始化数据库
npx prisma db push
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 生产部署

```bash
npm run build
npm start
```

详细部署指南见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)。

## 环境变量

参考 `.env.example`，主要配置项：

- `DATABASE_URL` — PostgreSQL 连接字符串
- `REDIS_URL` — Redis 连接字符串
- `JWT_SECRET` — JWT 签名密钥
- `YOUTUBE_API_KEY` — YouTube Data API v3 密钥（可选）
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — 管理面板初始账号

## 管理面板

访问 `/admin` 进入管理后台，可查看下载统计、管理缓存和监控系统状态。

## 许可证

MIT
