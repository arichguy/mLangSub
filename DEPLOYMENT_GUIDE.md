# mLangSub 部署指南（超详细版）

> 本文档面向零基础用户，每一个步骤都包含操作指令和验证方法。
> 如果你在任何步骤遇到问题，请仔细阅读"验证方法"和"常见问题"部分。

---

## 目录

- [一、项目简介](#一项目简介)
- [二、服务器要求](#二服务器要求)
- [三、方案一：Docker 部署（推荐，最简单）](#三方案一docker-部署推荐最简单)
- [四、方案二：宝塔面板部署](#四方案二宝塔面板部署)
- [五、方案三：手动上传部署](#五方案三手动上传部署)
- [六、SSL 证书配置（通用）](#六ssl-证书配置通用)
- [七、部署后验证](#七部署后验证)
- [八、日常运维](#八日常运维)
- [九、常见问题排查](#九常见问题排查)

---

## 一、项目简介

**mLangSub** 是一个多语言在线视频字幕下载工具，支持 YouTube、Bilibili、Viki 等 50+ 平台。

**核心依赖：**
| 依赖 | 用途 | 是否必须 |
|------|------|----------|
| Node.js 20+ | 运行 Next.js 应用 | ✅ 必须 |
| PostgreSQL 16 | 存储用户、缓存、日志等数据 | ✅ 必须 |
| Redis 7 | 字幕缓存（L1层），加速访问 | ✅ 必须 |
| Python 3 + yt-dlp | 字幕提取核心工具 | ✅ 必须 |
| Playwright + Chromium | 浏览器兜底方案（当 yt-dlp 失败时） | ⚠️ 可选 |
| Nginx | 反向代理 + SSL | ✅ 生产必须 |

**工作原理：**
```
用户输入视频链接 → Nginx 反向代理 → Next.js 应用 → yt-dlp 提取字幕 → 返回字幕文件
                                                    → (失败时) YouTube API
                                                    → (再失败) Playwright 浏览器模拟
```

---

## 二、服务器要求

| 配置 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 硬盘 | 50 GB SSD | 100 GB SSD |
| 带宽 | 5 Mbps | 10 Mbps+ |
| 操作系统 | Ubuntu 20.04 / 22.04 / 24.04 | Ubuntu 22.04 LTS |

> **提示：** 如果你使用的是 CentOS / Debian 等其他 Linux 发行版，大部分命令通用，仅包管理器命令不同（如 `yum` 替代 `apt`）。

---

## 三、方案一：Docker 部署（推荐，最简单）

> Docker 部署是最简单的方式，所有依赖（PostgreSQL、Redis、Node.js、yt-dlp）都打包在 Docker 容器中，无需手动安装。

### 3.1 前置条件：安装 Docker 和 Docker Compose

**步骤 1：登录服务器**

在你的电脑上打开终端（Windows 用 PowerShell / CMD，Mac 用 Terminal），输入：

```bash
ssh root@你的服务器IP地址
```

输入密码后回车，看到类似 `root@server:~#` 的提示符表示登录成功。

**✅ 验证方法：** 输入 `whoami`，应显示 `root`

---

**步骤 2：更新系统**

```bash
sudo apt update && sudo apt upgrade -y
```

等待命令执行完毕（可能需要几分钟）。

**✅ 验证方法：** 命令执行完毕无报错，回到命令提示符

---

**步骤 3：安装 Docker**

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sudo sh

# 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

**✅ 验证方法：** 输入以下命令，应显示 Docker 版本号

```bash
docker --version
# 预期输出类似：Docker version 24.0.7, build afdd53b
```

---

**步骤 4：安装 Docker Compose**

```bash
sudo apt install -y docker-compose-plugin
```

**✅ 验证方法：**

```bash
docker compose version
# 预期输出类似：Docker Compose version v2.21.0
```

> **注意：** 新版 Docker Compose 使用 `docker compose`（中间是空格），旧版使用 `docker-compose`（中间是横杠）。本项目使用新版语法。

---

### 3.2 上传项目文件

**步骤 5：安装 Git**

```bash
sudo apt install -y git
```

**✅ 验证方法：**

```bash
git --version
# 预期输出类似：git version 2.34.1
```

---

**步骤 6：克隆项目**

```bash
# 创建项目目录
sudo mkdir -p /opt/mLangSub
cd /opt/mLangSub

# 克隆代码（替换为你的仓库地址）
sudo git clone https://github.com/arichguy/mLangSub.git .
```

> 如果你没有 Git 仓库，也可以用"方案三：手动上传"的方式将项目文件上传到 `/opt/mLangSub` 目录。

**✅ 验证方法：**

```bash
ls /opt/mLangSub
# 应该能看到 package.json、Dockerfile、docker-compose.yml 等文件
```

---

### 3.3 配置环境变量

**步骤 7：创建 .env 文件**

```bash
cd /opt/mLangSub
cp .env.example .env
```

**步骤 8：编辑 .env 文件**

```bash
nano .env
```

> 如果你不会用 nano 编辑器，也可以用 `vi .env`。nano 更简单：编辑完后按 `Ctrl+O` 保存，按 `Enter` 确认，按 `Ctrl+X` 退出。

修改以下内容（**必须修改的项已标注 ⚠️**）：

```env
# ⚠️ 数据库连接
# DATABASE_URL 中的密码、用户名、库名必须与下方的 POSTGRES_* 变量一致
DATABASE_URL="postgresql://postgres:你的数据库密码@postgres:5432/mlangsub?schema=public"

# PostgreSQL 容器配置（需与上面 DATABASE_URL 保持一致）
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="你的数据库密码"
POSTGRES_DB="mlangsub"

# Redis - Docker 内部网络，直接用服务名
REDIS_URL="redis://redis:6379"

# ⚠️ JWT 密钥 - 必须修改为一个随机字符串！
JWT_SECRET="这里填一个随机字符串比如abc123xyz789"

# ⚠️ 应用地址 - 改为你的域名或IP
NEXT_PUBLIC_APP_URL="http://你的域名或IP:3000"
NEXT_PUBLIC_APP_NAME="mLangSub"

# YouTube API Key（可选，没有就不填）
YOUTUBE_API_KEY=""

# ⚠️ 管理员账号 - 强烈建议修改默认密码
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="修改为一个强密码"

# 文件存储路径
SUBTITLE_STORAGE_PATH="./data/subtitles"

# 限流配置
RATE_LIMIT_IP_PER_MIN=60
RATE_LIMIT_GLOBAL_PER_MIN=1000
```

**✅ 验证方法：** 确认 `.env` 文件存在且内容已修改

```bash
cat .env | grep JWT_SECRET
# 应显示你修改后的 JWT_SECRET，而不是默认值
```

---

**步骤 9：验证 docker-compose.yml（无需手动修改）**

`docker-compose.yml` 已使用 `${变量名}` 语法，会自动从 `.env` 文件读取配置，你只需确认 `.env` 配置正确即可，无需再手动同步密码。

```bash
# 快速检查变量引用是否正确（应全部为 ${...} 格式，无硬编码值）
grep -E '\$\{' docker-compose.yml
```

**✅ 验证方法：**

```bash
# 确认 docker-compose 能正确解析变量
docker compose config | grep -E 'POSTGRES_PASSWORD|DATABASE_URL|JWT_SECRET'
# 应显示你在 .env 中设置的实际值
```

---

### 3.4 启动 Docker 容器

**步骤 10：构建并启动所有服务**

```bash
cd /opt/mLangSub
sudo docker compose up -d --build
```

> 这个命令会：
> 1. 构建 Next.js 应用镜像（第一次可能需要 5-15 分钟）
> 2. 启动 PostgreSQL 容器
> 3. 启动 Redis 容器
> 4. 启动应用容器
>
> `--build` 表示重新构建镜像，后续启动可以省略此参数。

**✅ 验证方法：**

```bash
# 查看所有容器状态，应该都是 "Up"
sudo docker compose ps

# 预期输出类似：
# NAME                STATUS
# mLangSub-app        Up 2 minutes
# mLangSub-postgres   Up 2 minutes (healthy)
# mLangSub-redis      Up 2 minutes (healthy)
```

如果看到所有容器都是 `Up` 状态，说明启动成功！

---

**步骤 11：初始化数据库**

```bash
# 在应用容器中执行数据库迁移
sudo docker compose exec app npx prisma db push

# 初始化管理员账号和系统配置
sudo docker compose exec app npm run db:seed
```

**✅ 验证方法：**

```bash
# 检查数据库是否初始化成功
sudo docker compose exec postgres psql -U postgres -d mlangsub -c "\dt"

# 应该显示一系列数据表：AccessLog, SubtitleCache, VideoInfoCache, SystemConfig, Admin 等
```

---

**步骤 12：验证应用运行**

```bash
# 在服务器上测试访问
curl http://localhost:3000

# 应返回 HTML 内容（包含 mLangSub 字样）
```

在浏览器中访问 `http://你的服务器IP:3000`，应看到 mLangSub 首页。

---

### 3.5 配置 Nginx 反向代理（Docker 方案）

**步骤 13：安装 Nginx**

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**✅ 验证方法：**

```bash
nginx -v
# 预期输出：nginx version: nginx/1.x.x
```

---

**步骤 14：创建 Nginx 配置文件**

```bash
sudo nano /etc/nginx/sites-available/mLangSub
```

粘贴以下内容（将 `your-domain.com` 替换为你的域名，如果没有域名就用服务器IP）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

**步骤 15：启用配置并重载 Nginx**

```bash
# 创建软链接启用配置
sudo ln -s /etc/nginx/sites-available/mLangSub /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置是否正确
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

**✅ 验证方法：**

```bash
sudo nginx -t
# 预期输出：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

在浏览器中访问 `http://你的域名`（不带端口号），应看到 mLangSub 首页。

---

### 3.6 Docker 常用管理命令

```bash
# 查看容器状态
sudo docker compose ps

# 查看应用日志
sudo docker compose logs -f app

# 查看数据库日志
sudo docker compose logs -f postgres

# 重启应用
sudo docker compose restart app

# 停止所有服务
sudo docker compose down

# 重新构建并启动（代码更新后）
sudo docker compose up -d --build

# 进入应用容器内部
sudo docker compose exec app sh

# 更新 yt-dlp（在容器内）
sudo docker compose exec app python3 -m pip install -U yt-dlp
```

---

## 四、方案二：宝塔面板部署

> 宝塔面板提供了图形化界面，适合不熟悉命令行的用户。

### 4.1 安装宝塔面板

**步骤 1：登录服务器**

```bash
ssh root@你的服务器IP地址
```

---

**步骤 2：安装宝塔面板**

```bash
# Ubuntu/Debian 安装命令
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

安装过程中会提示：
```
Do you want to install Bt-Panel to the /www directory now?(y/n):
```
输入 `y` 回车，等待安装完成（约 5-10 分钟）。

安装成功后会显示：
```
==================================================================
Congratulations! Installed successfully!
==================================================================
外网面板地址: http://你的IP:8888/xxxx
内网面板地址: http://内网IP:8888/xxxx
username: xxxxxxxx
password: xxxxxxxx
```

> ⚠️ **重要：** 请将上面的面板地址、用户名和密码保存下来！

**✅ 验证方法：** 在浏览器中打开面板地址，能看到宝塔登录页面

---

**步骤 3：登录宝塔面板并安装基础软件**

1. 在浏览器中打开宝塔面板地址
2. 输入用户名和密码登录
3. 首次登录会弹出"推荐安装套件"窗口，选择 **LNMP** 套件
4. 确保以下软件被勾选安装：
   - ✅ **Nginx**（必须）
   - ✅ **PostgreSQL**（必须，如果列表中没有，后面单独安装）
   - ✅ **Redis**（必须，如果列表中没有，后面单独安装）
   - ❌ MySQL（不需要，可以不装）
   - ❌ PHP（不需要，可以不装）
5. 点击"提交"开始安装，等待安装完成

---

### 4.2 安装必要软件

**步骤 4：安装 PostgreSQL（如果前面没有安装）**

1. 在宝塔面板左侧菜单点击 **软件商店**
2. 搜索 `PostgreSQL`
3. 找到 PostgreSQL，点击"安装"
4. 选择版本 16，点击"提交"
5. 等待安装完成

---

**步骤 5：安装 Redis（如果前面没有安装）**

1. 在宝塔面板左侧菜单点击 **软件商店**
2. 搜索 `Redis`
3. 找到 Redis，点击"安装"
4. 选择版本 7.x，点击"提交"
5. 等待安装完成

---

**步骤 6：安装 PM2 管理器**

1. 在宝塔面板左侧菜单点击 **软件商店**
2. 搜索 `PM2`
3. 找到 `PM2管理器`，点击"安装"
4. 等待安装完成

---

**步骤 7：安装 Node.js**

1. 在宝塔面板左侧菜单点击 **软件商店**
2. 搜索 `Node.js版本管理器`
3. 点击"安装"
4. 安装完成后，点击"设置"
5. 在版本列表中找到 `v20.x.x`，点击"安装"
6. 等待安装完成，安装后点击"切换"将其设为默认版本

**✅ 验证方法：** 在宝塔面板中点击"终端"，输入：

```bash
node --version
# 预期输出：v20.x.x

npm --version
# 预期输出：9.x.x 或 10.x.x
```

---

### 4.3 配置 PostgreSQL 数据库

**步骤 8：创建数据库**

1. 在宝塔面板左侧菜单点击 **数据库**
2. 点击 **PostgreSQL** 标签（如果没有此标签，说明 PostgreSQL 未安装成功）
3. 点击 **添加数据库**
4. 填写信息：
   - 数据库名：`mlangsub`
   - 用户名：`mlangsub`
   - 密码：点击"生成"按钮生成一个强密码，**并记下来**
   - 权限：所有人（或本地服务器）
5. 点击"提交"

**✅ 验证方法：** 在数据库列表中能看到 `mlangsub` 数据库

---

### 4.4 上传项目文件

**步骤 9：上传项目代码**

**方式 A：通过 Git 克隆（推荐）**

1. 在宝塔面板点击"终端"
2. 执行以下命令：

```bash
# 安装 Git
sudo apt install -y git

# 进入网站根目录
cd /www/wwwroot

# 克隆项目
sudo git clone https://github.com/arichguy/mLangSub.git mLangSub
```

**方式 B：通过宝塔文件管理器上传**

1. 在你的本地电脑上，将整个项目文件夹压缩为 `.zip` 或 `.tar.gz`
2. 在宝塔面板左侧菜单点击 **文件**
3. 进入 `/www/wwwroot` 目录
4. 点击"上传"按钮，上传压缩包
5. 上传完成后，右键压缩包选择"解压"
6. 将解压后的文件夹重命名为 `mLangSub`

**✅ 验证方法：**

```bash
ls /www/wwwroot/mLangSub
# 应该能看到 package.json、next.config.mjs、src 等文件和目录
```

---

### 4.5 安装 Python 和 yt-dlp

**步骤 10：安装 Python 3**

```bash
sudo apt install -y python3 python3-pip
```

**✅ 验证方法：**

```bash
python3 --version
# 预期输出：Python 3.10.x 或更高
```

---

**步骤 11：安装 yt-dlp**

```bash
python3 -m pip install -U yt-dlp
```

如果提示权限错误，使用：

```bash
python3 -m pip install -U yt-dlp --break-system-packages
```

**✅ 验证方法：**

```bash
yt-dlp --version
# 预期输出：2024.xx.xx 或更高版本号
```

---

### 4.6 配置项目

**步骤 12：配置环境变量**

```bash
cd /www/wwwroot/mLangSub
cp .env.example .env
nano .env
```

修改以下内容：

```env
# ⚠️ 数据库连接 - 替换为你在步骤8中创建的数据库信息
DATABASE_URL="postgresql://mlangsub:你的数据库密码@localhost:5432/mlangsub?schema=public"

# Redis - 本地安装，默认端口
REDIS_URL="redis://localhost:6379"

# ⚠️ JWT 密钥 - 必须修改！
JWT_SECRET="这里填一个随机字符串"

# ⚠️ 应用地址
NEXT_PUBLIC_APP_URL="http://你的域名或IP"
NEXT_PUBLIC_APP_NAME="mLangSub"

# YouTube API Key（可选）
YOUTUBE_API_KEY=""

# ⚠️ 管理员账号
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="修改为一个强密码"

# 文件存储路径
SUBTITLE_STORAGE_PATH="./data/subtitles"

# 限流配置
RATE_LIMIT_IP_PER_MIN=60
RATE_LIMIT_GLOBAL_PER_MIN=1000
```

**✅ 验证方法：**

```bash
cat /www/wwwroot/mLangSub/.env | grep DATABASE_URL
# 应显示你修改后的数据库连接字符串
```

---

**步骤 13：安装 Node.js 依赖**

```bash
cd /www/wwwroot/mLangSub
npm ci
```

> 如果 `npm ci` 报错，尝试 `npm install`。这个过程可能需要 3-5 分钟。

**✅ 验证方法：**

```bash
ls /www/wwwroot/mLangSub/node_modules | head -5
# 应显示一些包名，如 @prisma、bcryptjs 等
```

---

**步骤 14：初始化数据库**

```bash
cd /www/wwwroot/mLangSub

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push
```

如果 `prisma db push` 报连接错误，检查：
1. PostgreSQL 是否正在运行：`sudo systemctl status postgresql`
2. `.env` 中的 `DATABASE_URL` 是否正确
3. 数据库用户名、密码、数据库名是否匹配

```bash
# 初始化管理员账号和系统配置
npm run db:seed
```

**✅ 验证方法：**

```bash
# 检查数据表是否创建成功
sudo -u postgres psql -d mlangsub -c "\dt"
# 应显示 AccessLog、Admin、SubtitleCache 等表
```

---

**步骤 15：构建项目**

```bash
cd /www/wwwroot/mLangSub
npm run build
```

> 构建过程需要 2-5 分钟，请耐心等待。如果报错，请检查 Node.js 版本是否为 20+。

**✅ 验证方法：**

```bash
ls /www/wwwroot/mLangSub/.next
# 应显示 standalone、static 等目录
```

---

### 4.7 使用 PM2 启动应用

**步骤 16：通过宝塔 PM2 管理器启动**

1. 在宝塔面板左侧菜单点击 **软件商店**
2. 找到 **PM2管理器**，点击"设置"
3. 点击 **添加项目**
4. 填写信息：
   - 项目名称：`mLangSub`
   - 启动文件：选择 `/www/wwwroot/mLangSub/node_modules/.bin/next`（或手动输入路径）
   - 运行目录：`/www/wwwroot/mLangSub`
   - 启动命令：`start`（即执行 `npm start`）
5. 点击"提交"

**或者通过命令行启动：**

```bash
cd /www/wwwroot/mLangSub
pm2 start npm --name "mLangSub" -- start
pm2 save
```

**✅ 验证方法：**

```bash
pm2 status
# 应显示 mLangSub 状态为 online

curl http://localhost:3000
# 应返回 HTML 内容
```

---

### 4.8 配置 Nginx 反向代理（宝塔方式）

**步骤 17：创建网站**

1. 在宝塔面板左侧菜单点击 **网站**
2. 点击 **添加站点**
3. 填写信息：
   - 域名：输入你的域名（如 `sub.example.com`），没有域名就输入服务器IP
   - 根目录：`/www/wwwroot/mLangSub`（可以不改，因为我们要用反向代理）
   - PHP版本：选择"纯静态"
   - 数据库：不创建
4. 点击"提交"

---

**步骤 18：设置反向代理**

1. 在网站列表中找到刚创建的站点，点击"设置"
2. 在左侧菜单点击 **反向代理**
3. 点击 **添加反向代理**
4. 填写信息：
   - 代理名称：`mLangSub`
   - 目标URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`
5. 点击"提交"

**✅ 验证方法：** 在浏览器中访问 `http://你的域名`，应看到 mLangSub 首页

---

**步骤 19：设置开机自启**

```bash
pm2 startup
pm2 save
```

**✅ 验证方法：** 重启服务器后，检查应用是否自动启动

```bash
sudo reboot
# 等待重启完成后重新连接
pm2 status
# 应显示 mLangSub 状态为 online
```

---

### 4.9 安装 Playwright（可选）

> Playwright 是浏览器兜底方案，当 yt-dlp 无法提取字幕时会自动使用。建议安装。

```bash
cd /www/wwwroot/mLangSub
npx playwright install chromium
npx playwright install-deps chromium
```

> 安装 Chromium 浏览器可能需要 200-500MB 空间。

**✅ 验证方法：**

```bash
npx playwright --version
# 应显示版本号
```

---

## 五、方案三：手动上传部署

> 适合无法使用 Git、也没有宝塔面板的用户。通过 FTP/SFTP 工具将项目文件上传到服务器。

### 5.1 连接服务器

**步骤 1：通过 SSH 连接服务器**

```bash
ssh root@你的服务器IP地址
```

---

### 5.2 安装所有依赖

**步骤 2：更新系统**

```bash
sudo apt update && sudo apt upgrade -y
```

---

**步骤 3：安装 Node.js 20**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**✅ 验证方法：**

```bash
node --version
# 预期输出：v20.x.x

npm --version
# 预期输出：9.x.x 或 10.x.x
```

---

**步骤 4：安装 Python 3 和 yt-dlp**

```bash
sudo apt install -y python3 python3-pip
python3 -m pip install -U yt-dlp
```

如果 pip 安装 yt-dlp 报权限错误：

```bash
python3 -m pip install -U yt-dlp --break-system-packages
```

**✅ 验证方法：**

```bash
python3 --version
# 预期输出：Python 3.10.x 或更高

yt-dlp --version
# 预期输出：版本号
```

---

**步骤 5：安装 PostgreSQL**

```bash
sudo apt install -y postgresql postgresql-contrib

# 启动并设置开机自启
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**✅ 验证方法：**

```bash
sudo systemctl status postgresql
# 应显示 active (exited) 或 active (running)
```

---

**步骤 6：创建数据库和用户**

```bash
# 进入 PostgreSQL 命令行
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行以下命令（每行一条，以分号结尾）：
CREATE USER mlangsub WITH PASSWORD '你的密码';
CREATE DATABASE mlangsub OWNER mlangsub;
\q
```

> ⚠️ 将 `你的密码` 替换为一个强密码，并记下来！

**✅ 验证方法：**

```bash
sudo -u postgres psql -c "\l"
# 在数据库列表中应能看到 mlangsub 数据库
```

---

**步骤 7：安装 Redis**

```bash
sudo apt install -y redis-server

# 启动并设置开机自启
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**✅ 验证方法：**

```bash
redis-cli ping
# 预期输出：PONG
```

---

**步骤 8：安装 Nginx**

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**✅ 验证方法：**

```bash
nginx -v
# 预期输出：nginx version: nginx/1.x.x
```

---

**步骤 9：安装 PM2**

```bash
sudo npm install -g pm2
```

**✅ 验证方法：**

```bash
pm2 --version
# 预期输出：版本号
```

---

### 5.3 上传项目文件

**步骤 10：在本地电脑上准备项目文件**

1. 在你的本地电脑上，找到项目文件夹 `subtitle_claude`
2. 将整个文件夹压缩为 `.zip` 或 `.tar.gz` 格式
   - Windows：右键 → 压缩为 ZIP
   - Mac：右键 → 压缩

---

**步骤 11：使用 SFTP 工具上传**

**推荐工具：**
- **WinSCP**（Windows）：https://winscp.net/
- **FileZilla**（全平台）：https://filezilla-project.org/
- **Transmit**（Mac）：https://panic.com/transmit/

以 **FileZilla** 为例：

1. 下载并安装 FileZilla
2. 打开 FileZilla，在顶部输入：
   - 主机：`sftp://你的服务器IP`
   - 用户名：`root`
   - 密码：你的服务器密码
   - 端口：`22`
3. 点击"快速连接"
4. 在右侧（远程站点）导航到 `/www/wwwroot/` 目录
   - 如果 `/www/wwwroot/` 不存在，先创建：`sudo mkdir -p /www/wwwroot`
5. 在左侧（本地站点）找到你的项目压缩包
6. 将压缩包从左侧拖拽到右侧
7. 等待上传完成

---

**步骤 12：解压项目文件**

```bash
# 如果上传的是 .zip 文件
sudo apt install -y unzip
cd /www/wwwroot
sudo unzip mLangSub.zip -d mLangSub

# 如果上传的是 .tar.gz 文件
cd /www/wwwroot
sudo mkdir -p mLangSub
sudo tar -xzf mLangSub.tar.gz -C mLangSub
```

**✅ 验证方法：**

```bash
ls /www/wwwroot/mLangSub
# 应该能看到 package.json、src、prisma 等文件和目录
```

---

### 5.4 配置项目

**步骤 13：配置环境变量**

```bash
cd /www/wwwroot/mLangSub
cp .env.example .env
nano .env
```

修改以下内容：

```env
# ⚠️ 数据库连接 - 使用步骤6中创建的用户和密码
DATABASE_URL="postgresql://mlangsub:你的密码@localhost:5432/mlangsub?schema=public"

# Redis - 本地默认配置
REDIS_URL="redis://localhost:6379"

# ⚠️ JWT 密钥 - 必须修改！
JWT_SECRET="这里填一个随机字符串"

# ⚠️ 应用地址
NEXT_PUBLIC_APP_URL="http://你的域名或IP"
NEXT_PUBLIC_APP_NAME="mLangSub"

# YouTube API Key（可选）
YOUTUBE_API_KEY=""

# ⚠️ 管理员账号
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="修改为一个强密码"

# 文件存储路径
SUBTITLE_STORAGE_PATH="./data/subtitles"

# 限流配置
RATE_LIMIT_IP_PER_MIN=60
RATE_LIMIT_GLOBAL_PER_MIN=1000
```

**✅ 验证方法：**

```bash
cat /www/wwwroot/mLangSub/.env | grep DATABASE_URL
# 应显示你修改后的连接字符串
```

---

**步骤 14：安装依赖**

```bash
cd /www/wwwroot/mLangSub
npm ci
```

如果 `npm ci` 报错，使用：

```bash
rm -rf node_modules package-lock.json
npm install
```

**✅ 验证方法：**

```bash
ls node_modules | wc -l
# 应显示一个数字（如 200+），表示依赖已安装
```

---

**步骤 15：初始化数据库**

```bash
cd /www/wwwroot/mLangSub

# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push
```

如果报错 `Can't reach database server`，请检查：
1. PostgreSQL 是否运行：`sudo systemctl status postgresql`
2. `.env` 中 `DATABASE_URL` 是否正确
3. 防火墙是否阻止了 5432 端口

```bash
# 初始化管理员账号和系统配置
npm run db:seed
```

**✅ 验证方法：**

```bash
sudo -u postgres psql -d mlangsub -c "SELECT username FROM \"Admin\";"
# 应显示 admin 用户
```

---

**步骤 16：构建项目**

```bash
cd /www/wwwroot/mLangSub
npm run build
```

> 构建过程需要 2-5 分钟。如果内存不足导致构建失败，可以临时增加交换空间：
> ```bash
> sudo fallocate -l 4G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> ```

**✅ 验证方法：**

```bash
ls /www/wwwroot/mLangSub/.next/standalone
# 应显示 server.js 等文件
```

---

**步骤 17：创建数据目录**

```bash
cd /www/wwwroot/mLangSub
mkdir -p data/subtitles data/tmp
```

---

### 5.5 启动应用

**步骤 18：使用 PM2 启动**

```bash
cd /www/wwwroot/mLangSub
pm2 start npm --name "mLangSub" -- start

# 保存 PM2 进程列表
pm2 save

# 设置开机自启
pm2 startup
```

`pm2 startup` 命令会输出一条类似下面的命令，你需要复制并执行它：

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

**✅ 验证方法：**

```bash
pm2 status
# 应显示 mLangSub 状态为 online

curl http://localhost:3000
# 应返回 HTML 内容
```

---

### 5.6 配置 Nginx

**步骤 19：创建 Nginx 配置**

```bash
sudo nano /etc/nginx/sites-available/mLangSub
```

粘贴以下内容（将 `your-domain.com` 替换为你的域名）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

**步骤 20：启用配置**

```bash
sudo ln -s /etc/nginx/sites-available/mLangSub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

**✅ 验证方法：**

```bash
sudo nginx -t
# 预期输出：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

在浏览器中访问 `http://你的域名`，应看到 mLangSub 首页。

---

### 5.7 安装 Playwright（可选）

```bash
cd /www/wwwroot/mLangSub
npx playwright install chromium
npx playwright install-deps chromium
```

**✅ 验证方法：**

```bash
npx playwright --version
# 应显示版本号
```

---

## 六、SSL 证书配置（通用）

> SSL 证书让你的网站从 `http://` 变为 `https://`，更安全，浏览器也不会提示"不安全"。

### 6.1 使用 Certbot 免费证书（命令行方式）

**前提：** 你已经有一个域名，并且域名的 A 记录已指向服务器 IP。

**步骤 1：安装 Certbot**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

**步骤 2：申请证书**

```bash
sudo certbot --nginx -d your-domain.com
```

将 `your-domain.com` 替换为你的域名。

执行过程中会询问：
1. 输入邮箱地址（用于证书到期提醒）→ 输入你的邮箱
2. 同意服务条款 → 输入 `Y`
3. 是否重定向 HTTP 到 HTTPS → 选择 `2`（重定向）

**✅ 验证方法：**

在浏览器中访问 `https://你的域名`，应看到：
- 地址栏显示锁头图标
- 网站正常加载

---

**步骤 3：设置自动续期**

Certbot 会自动设置定时任务，但可以手动验证：

```bash
sudo certbot renew --dry-run
# 预期输出：Congratulations, all simulated renewals succeeded
```

---

### 6.2 使用宝塔面板申请 SSL 证书

1. 在宝塔面板左侧菜单点击 **网站**
2. 找到你的站点，点击"设置"
3. 在左侧菜单点击 **SSL**
4. 选择 **Let's Encrypt**
5. 勾选你的域名
6. 点击"申请"
7. 申请成功后，开启"强制HTTPS"

**✅ 验证方法：** 在浏览器中访问 `https://你的域名`，地址栏应显示锁头图标

---

## 七、部署后验证

> 完成部署后，请按以下清单逐项验证，确保一切正常。

### 7.1 基础服务验证

| 验证项 | 命令 | 预期结果 |
|--------|------|----------|
| Node.js | `node --version` | v20.x.x |
| Python | `python3 --version` | Python 3.10+ |
| yt-dlp | `yt-dlp --version` | 版本号 |
| PostgreSQL | `sudo systemctl status postgresql` | active (running) |
| Redis | `redis-cli ping` | PONG |
| Nginx | `sudo systemctl status nginx` | active (running) |
| 应用进程 | `pm2 status` 或 `docker compose ps` | online / Up |

### 7.2 功能验证

**验证 1：首页可访问**

```bash
curl -I http://localhost:3000
# 预期输出包含：HTTP/1.1 200 OK
```

**验证 2：API 可用**

```bash
curl http://localhost:3000/api/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=jNQXAC9IVRw"}'
```

预期返回 JSON 数据，包含 `success: true` 和字幕列表。

> ⚠️ 如果返回错误，可能是 yt-dlp 被限制，尝试其他视频链接。

**验证 3：管理面板可访问**

在浏览器中访问 `http://你的域名/admin`，应显示管理员登录页面。

使用 `.env` 中配置的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 登录。

**验证 4：字幕下载功能**

1. 在首页输入一个 YouTube 视频链接
2. 点击"分析"
3. 等待分析完成，应显示可用字幕列表
4. 选择一种字幕，点击下载
5. 应成功下载字幕文件

---

## 八、日常运维

### 8.1 更新应用

**Docker 方式：**

```bash
cd /opt/mLangSub
git pull
sudo docker compose up -d --build
```

**宝塔 / 手动方式：**

```bash
cd /www/wwwroot/mLangSub
git pull
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart mLangSub
```

**手动上传方式（无 Git）：**

1. 在本地电脑上更新项目文件
2. 通过 SFTP 上传覆盖服务器上的文件
3. 在服务器上执行：

```bash
cd /www/wwwroot/mLangSub
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart mLangSub
```

---

### 8.2 更新 yt-dlp

yt-dlp 需要经常更新以适配视频网站的变化，建议每周更新一次：

```bash
python3 -m pip install -U yt-dlp
```

Docker 方式：

```bash
sudo docker compose exec app python3 -m pip install -U yt-dlp
# 或者重新构建镜像
sudo docker compose up -d --build
```

---

### 8.3 查看日志

**PM2 方式：**

```bash
# 查看实时日志
pm2 logs mLangSub

# 查看最近 100 行日志
pm2 logs mLangSub --lines 100

# 清除日志
pm2 flush mLangSub
```

**Docker 方式：**

```bash
# 查看应用日志
sudo docker compose logs -f app

# 查看最近 100 行
sudo docker compose logs --tail 100 app

# 查看数据库日志
sudo docker compose logs -f postgres
```

---

### 8.4 数据库备份

**手动备份：**

```bash
# 创建备份目录
mkdir -p /backup/postgres

# 备份数据库
sudo -u postgres pg_dump mlangsub > /backup/postgres/mLangSub_$(date +%Y%m%d).sql
```

**Docker 方式：**

```bash
sudo docker compose exec postgres pg_dump -U postgres mlangsub > /backup/postgres/mLangSub_$(date +%Y%m%d).sql
```

**设置自动备份（crontab）：**

```bash
crontab -e
```

添加以下行（每天凌晨 3 点备份）：

```
0 3 * * * sudo -u postgres pg_dump mlangsub > /backup/postgres/mLangSub_$(date +\%Y\%m\%d).sql
```

---

### 8.5 监控

```bash
# PM2 监控面板
pm2 monit

# 查看服务器资源
htop

# 查看磁盘空间
df -h

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 九、常见问题排查

### Q1：访问网站显示 502 Bad Gateway

**原因：** Nginx 无法连接到 Node.js 应用。

**排查步骤：**

```bash
# 1. 检查应用是否运行
pm2 status
# 或 Docker 方式
sudo docker compose ps

# 2. 如果应用未运行，启动它
pm2 restart mLangSub
# 或
sudo docker compose restart app

# 3. 检查应用日志
pm2 logs mLangSub --lines 50
# 或
sudo docker compose logs --tail 50 app

# 4. 检查端口是否被占用
sudo lsof -i :3000
```

---

### Q2：npm run build 失败，提示内存不足

**解决方案：** 增加 swap 空间

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 验证
free -h
# 应显示 Swap 行有 4G

# 重新构建
npm run build
```

---

### Q3：数据库连接失败

**排查步骤：**

```bash
# 1. 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 2. 如果未运行，启动它
sudo systemctl start postgresql

# 3. 测试连接
sudo -u postgres psql -d mlangsub -c "SELECT 1;"

# 4. 检查 .env 中的 DATABASE_URL 是否正确
cat /www/wwwroot/mLangSub/.env | grep DATABASE_URL

# 5. Docker 方式：确认容器名正确
# .env 中应使用 postgres（Docker 服务名），而不是 localhost
```

---

### Q4：Redis 连接失败

**排查步骤：**

```bash
# 1. 检查 Redis 是否运行
sudo systemctl status redis-server
# 或
redis-cli ping

# 2. 如果未运行，启动它
sudo systemctl start redis-server

# 3. Docker 方式：确认 .env 中使用 redis（Docker 服务名）
# REDIS_URL="redis://redis:6379"
```

---

### Q5：字幕提取失败 / 返回空列表

**排查步骤：**

```bash
# 1. 检查 yt-dlp 是否安装
yt-dlp --version

# 2. 手动测试 yt-dlp
yt-dlp --list-subs "https://www.youtube.com/watch?v=jNQXAC9IVRw"

# 3. 如果 yt-dlp 报错，更新到最新版本
python3 -m pip install -U yt-dlp

# 4. Docker 方式：在容器内测试
sudo docker compose exec app yt-dlp --version
sudo docker compose exec app yt-dlp --list-subs "https://www.youtube.com/watch?v=jNQXAC9IVRw"
```

---

### Q6：端口 3000 被占用

```bash
# 查看谁占用了 3000 端口
sudo lsof -i :3000

# 杀掉占用进程（将 PID 替换为实际进程ID）
sudo kill -9 PID

# 或者修改应用端口
# 在 .env 中添加 PORT=3001
# 同时修改 Nginx 配置中的 proxy_pass 为 3001
```

---

### Q7：Docker 容器启动后立即退出

```bash
# 查看容器日志
sudo docker compose logs app

# 常见原因：
# 1. .env 文件配置错误 → 检查 DATABASE_URL 和 REDIS_URL
# 2. 数据库未就绪 → 等待 postgres 容器健康检查通过
# 3. 构建失败 → 重新构建：sudo docker compose up -d --build
```

---

### Q8：访问管理面板提示 JWT_SECRET 错误

**原因：** 生产环境中 `JWT_SECRET` 仍为默认值 `change-this-to-a-random-secret`。

**解决方案：**

```bash
# 编辑 .env 文件
nano /www/wwwroot/mLangSub/.env
# 或 Docker 方式
nano /opt/mLangSub/.env

# 将 JWT_SECRET 修改为一个随机字符串
JWT_SECRET="你的随机字符串至少32位"

# 重启应用
pm2 restart mLangSub
# 或 Docker 方式
sudo docker compose restart app
```

---

### Q9：防火墙配置

如果无法从外部访问网站，可能需要开放端口：

```bash
# 开放 80 端口（HTTP）
sudo ufw allow 80

# 开放 443 端口（HTTPS）
sudo ufw allow 443

# 开放 3000 端口（仅调试时需要，生产环境不需要）
sudo ufw allow 3000

# 查看防火墙状态
sudo ufw status
```

> ⚠️ 如果使用的是云服务器（阿里云、腾讯云等），还需要在云控制台的安全组中开放对应端口。

---

### Q10：如何查看应用版本和运行状态

```bash
# 查看应用运行状态
pm2 status

# 查看应用详细信息
pm2 describe mLangSub

# 查看实时资源使用
pm2 monit

# Docker 方式
sudo docker compose ps
sudo docker stats mLangSub-app
```

---

## 附录 A：环境变量完整说明

| 变量名 | 说明 | 示例 | 是否必须 |
|--------|------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://mlangsub:pass@localhost:5432/mlangsub` | ✅ 必须 |
| `REDIS_URL` | Redis 连接字符串 | `redis://localhost:6379` | ✅ 必须 |
| `JWT_SECRET` | JWT 签名密钥，生产环境必须修改 | 随机字符串，至少 32 位 | ✅ 必须 |
| `NEXT_PUBLIC_APP_URL` | 应用对外访问地址 | `https://sub.example.com` | ✅ 必须 |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `mLangSub` | ❌ 可选 |
| `YOUTUBE_API_KEY` | YouTube Data API v3 密钥 | `AIzaSy...` | ❌ 可选 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | ❌ 可选 |
| `ADMIN_PASSWORD` | 管理员密码 | 强密码 | ✅ 建议修改 |
| `SUBTITLE_STORAGE_PATH` | 字幕文件存储路径 | `./data/subtitles` | ❌ 可选 |
| `RATE_LIMIT_IP_PER_MIN` | 每 IP 每分钟请求限制 | `60` | ❌ 可选 |
| `RATE_LIMIT_GLOBAL_PER_MIN` | 全局每分钟请求限制 | `1000` | ❌ 可选 |

---

## 附录 B：端口说明

| 端口 | 服务 | 是否需要对外暴露 |
|------|------|------------------|
| 80 | Nginx (HTTP) | ✅ 是 |
| 443 | Nginx (HTTPS) | ✅ 是 |
| 3000 | Next.js 应用 | ❌ 否（通过 Nginx 代理） |
| 5432 | PostgreSQL | ❌ 否（仅本地访问） |
| 6379 | Redis | ❌ 否（仅本地访问） |

---

## 附录 C：目录结构说明

```
mLangSub/
├── .env                    # 环境变量配置（从 .env.example 复制）
├── .next/                  # 构建输出目录（npm run build 后生成）
│   ├── standalone/         # 独立部署文件
│   └── static/             # 静态资源
├── data/                   # 运行时数据目录
│   ├── subtitles/          # 字幕文件缓存
│   └── tmp/                # 临时文件
├── node_modules/           # Node.js 依赖包
├── prisma/                 # 数据库 Schema
│   └── schema.prisma       # 数据库表定义
├── public/                 # 静态资源
│   ├── images/             # 图片
│   └── locales/            # 多语言翻译文件
├── scripts/                # 工具脚本
│   ├── seed-db.ts          # 数据库初始化脚本
│   ├── setup-ytdlp.sh      # yt-dlp 安装脚本
│   └── setup-playwright.sh # Playwright 安装脚本
├── src/                    # 源代码
│   ├── app/                # Next.js 页面和 API
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 核心库
│   │   ├── anti-limit/     # 反限流模块
│   │   ├── db/             # 数据库连接
│   │   ├── platform/       # 平台适配器
│   │   ├── security/       # 安全模块
│   │   ├── seo/            # SEO 模块
│   │   ├── subtitle/       # 字幕处理核心
│   │   └── video/          # 视频信息处理
│   ├── middleware.ts        # Next.js 中间件
│   └── types/              # TypeScript 类型定义
├── Dockerfile              # Docker 镜像定义
├── docker-compose.yml      # Docker Compose 编排
├── next.config.mjs         # Next.js 配置
├── package.json            # 项目依赖
└── tailwind.config.ts      # Tailwind CSS 配置
```
