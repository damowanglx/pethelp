# PetHelp — 宠物互助平台

## What This Is

微信小程序宠物互助平台。三大差异化武器：
- **GPS 实时遛狗追踪**：遛狗中实时位置共享 + 轨迹回放
- **信任信用体系**：经验认证 + 徽章系统 + 评分公式
- **AI 宠物健康助手**：RAG (MySQL FULLTEXT → LLM) 智能问诊

## Tech Stack

| 层 | 选型 |
|---|------|
| 前端 | uni-app (Vue3 + TS + Pinia) → 微信小程序 |
| 后端 | NestJS (TypeScript) + TypeORM |
| 数据库 | MySQL 8 |
| 缓存 | Redis 7 |
| AI | DeepSeek/通义千问 (OpenAI 兼容) |

## Project Structure

```
pethelp/
├── pethelp-server/              # NestJS 后端 (11 modules, 15 entities, 50+ endpoints)
│   ├── src/modules/
│   │   ├── auth/                # 微信登录→JWT
│   │   ├── users/               # 用户CRUD + 角色切换
│   │   ├── pets/                # 宠物CRUD
│   │   ├── walking/             # 遛狗请求 + 匹配状态机 + GPS追踪 + WalkingGateway
│   │   ├── chat/                # 聊天REST + ChatGateway (Socket.IO)
│   │   ├── knowledge/           # 知识库(分类+文章+全文搜索)
│   │   ├── reviews/             # 评价+标签+双向互评
│   │   ├── trust/               # 认证+徽章(规则引擎)+信用分+押金
│   │   └── ai-health/           # AI问诊RAG+限流(10次/天)+缓存(24h)
│   ├── sql/001-schema.sql       # 完整DDL (15张表)
│   ├── seed/                    # 种子数据 (12徽章, 19分类, 8文章)
│   └── scripts/verify.ps1       # Stop hook 验证脚本
│
├── pethelp-client/              # uni-app 前端 (22 pages, 6 stores, 7 api modules)
│   └── src/
│       ├── pages/               # index, walking(6), chat(2), profile(5), knowledge(3), trust(3), ai-health(2), user
│       ├── stores/              # user, walking, chat, knowledge, trust, ai-health
│       ├── api/                 # request, auth, pet, walking, chat, review, trust, ai-health
│       └── types/               # api, user, pet, walking, chat
│
├── docs/plan.md                 # 完整架构设计 + 实施计划
└── CLAUDE.md
```

## Current State — ALL PHASES COMPLETE ✅

| Phase | 状态 | 内容 |
|-------|------|------|
| 0 | ✅ | 脚手架 + 15表DDL + Auth + 基础骨架 |
| 1 | ✅ | 遛狗匹配 + 认证 + 评价 + 信用分 |
| 2 | ✅ | GPS实时追踪 (WS广播 + REST备选 + 轨迹回放) |
| 3 | ✅ | 即时聊天 (Socket.IO rooms + 消息持久化) |
| 4 | ✅ | AI健康助手 (RAG + 限流 + 缓存) + 徽章引擎 + 知识库 |

## How to Start

```bash
# 后端
cd pethelp-server
cp .env.example .env   # 填入 WECHAT_APPID, WECHAT_SECRET, LLM_API_KEY
docker compose up -d    # 启动 MySQL + Redis
npm install
npm run start:dev

# 前端
cd pethelp-client
npm install
npm run dev:mp-weixin   # 编译 → 微信开发者工具打开 dist/dev/mp-weixin
```

## Key Architecture Notes

### WebSocket Gateways (3个)
- `WalkingGateway` (/ws/walking): GPS tracking + match events
- `ChatGateway` (/ws/chat): real-time messaging rooms
- GPS fallback: WS断开 → REST polling (POST /walks/locations, GET .../latest)

### Match State Machine
```
applied → accepted → in_progress → completed
   ↓         ↓
rejected  cancelled
```
Owner accepts one → all others auto-rejected. Walk starts → GPS tracking begins.

### AI RAG Pipeline
```
User query → SHA256 hash → Redis cache (24h) → miss? → MySQL FULLTEXT search articles
→ build prompt → DeepSeek/通义千问 → structured JSON response → cache + save DB
```
Rate limit: 10 queries/user/day (Redis counter)

### Credit Score Formula
```
score = (rating_avg/5 * 50) + (completion_rate * 30) + (min(experiene_years,10)/10 * 20)
```

### Badge Rules (data-driven, JSON in badge_definitions table)
- walks_count >= 50 → "资深铲屎官"
- completion_rate >= 0.95 + 20 walks → "靠谱之星"
- cert_type = "medical" → "医疗护理认证"
- consultations >= 10 → "AI健康达人"

## Verification

```bash
# Stop hook (runs automatically on session end)
powershell -File pethelp-server/scripts/verify.ps1

# Manual checks
cd pethelp-server && npx tsc --noEmit && npx nest build
```

## Code Style Rules (from user preferences)

- 不可变模式：永远创建新对象
- 小文件：200-400 行，最多 800 行
- 全量错误处理
- Zod 校验用户输入
- 禁止 console.log（用 NestJS Logger）
- API 响应格式：`{ success, data?, error?, meta? }`
- TypeORM nullable 字段 where 条件用 `as any` 避免类型错误
