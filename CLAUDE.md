# PetHelp — 宠物互助平台

## What This Is

微信小程序宠物互助平台。三大差异化武器：
- **GPS 实时遛狗追踪**：遛狗中实时位置共享 + 轨迹回放
- **信任信用体系**：经验认证 + 徽章系统 + 评分公式
- **AI 宠物健康助手**：RAG + LLM 智能问诊

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
├── pethelp-server/     # NestJS 后端
├── pethelp-client/     # uni-app 前端
├── docs/               # 文档
└── CLAUDE.md           # 这个文件
```

## The Plan

完整实施计划：[docs/plan.md](docs/plan.md)

5 阶段 10 周：
- Phase 0 ✅ 完成 — 脚手架 + 数据库 + 认证 + 前端骨架
- Phase 1 — 核心闭环：遛狗匹配 + 基础认证 + 评价
- Phase 2 — GPS 实时追踪
- Phase 3 — 即时聊天
- Phase 4 — AI 健康助手 + 信任深化 + 知识库 + 收尾

## How to Start

```bash
# 后端
cd pethelp-server
cp .env.example .env   # 填写微信 AppID 等配置
docker compose up -d    # 启动 MySQL + Redis
npm install
npm run start:dev

# 前端
cd pethelp-client
npm install
npm run dev:mp-weixin   # 编译 → 微信开发者工具打开 dist/dev/mp-weixin
```

## Current State (after Phase 0)

- **后端**: NestJS 构建通过，Auth 模块完整（微信登录→JWT），所有 15 个 TypeORM 实体就绪，10 个模块骨架
- **前端**: uni-app 22 页面骨架，Pinia stores (user/walking/chat/knowledge)，HTTP 请求拦截器
- **数据库**: 完整 DDL at `pethelp-server/sql/001-schema.sql`
- **种子数据**: 12 徽章定义 + 19 知识库分类 + 8 篇知识库文章

## Phase 1 Next Steps

实现核心闭环：
1. Walking Request CRUD + 附近查询
2. Match 状态机（申请→接受→拒绝→完成）
3. Certification 申请+审批
4. Review 评价 + tags
5. 对应的前端页面实现

## Code Style Rules (from user preferences)

- 不可变模式：永远创建新对象，不修改原对象
- 小文件：200-400 行，最多 800 行
- 全量错误处理
- Zod 校验用户输入
- 禁止 console.log（用 Logger）
- API 响应格式：`{ success, data?, error?, meta? }`
