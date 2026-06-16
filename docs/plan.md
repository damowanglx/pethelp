# PetHelp — 宠物互助平台 实施计划 v2

## Context

做一个宠物互助微信小程序，核心竞争力三件套：**实时GPS遛狗追踪 + 信任信用体系 + AI宠物健康助手**。起步微信小程序，后续扩展到网页和 App。

### VS 竞品差异化

| 能力 | 爱犬 | 宠胖胖 | PetHelp |
|------|------|--------|---------|
| 无偿互助遛狗 | ✅ | ❌ | ✅ |
| GPS实时追踪 | ✅ (事后) | ❌ | ✅ **遛狗中实时** |
| 信用评分+认证 | 基础 | 部分 | ✅ **多维度+徽章** |
| 即时聊天 | ❌ | ✅ | ✅ |
| AI健康助手 | ❌ | ❌ | ✅ **RAG+LLM** |
| 知识库 | ❌ | ❌ | ✅ 品种/疾病/用药 |

## Tech Stack

| 层 | 选型 | 理由 |
|---|------|------|
| 前端 | **uni-app** (Vue3 + TS + Pinia) | 一套代码 → 微信小程序 + H5 + iOS/Android |
| UI | uView Plus | 小程序原生适配 |
| 后端 | **NestJS** (TypeScript) | API 优先 + WebSocket 内置 + 模块化 |
| 数据库 | MySQL 8 | 空间索引 + ngram 全文索引 |
| 缓存 | Redis 7 | 会话/JWT黑名单/WS Pub-Sub/热数据/AI查询缓存 |
| AI | DeepSeek / 通义千问 (OpenAI 兼容) | 国内可用，成本低 |
| 部署 | Docker Compose (dev) → 云服务器 (prod) | 环境统一 |

## Go-to-Market Strategy

**冷启动方案（必须跟产品一起思考）：**

1. **单点突破**：选 1-2 个中大型小区（5000+户）做种子，铺地推海报 + 宠物店合作，不铺全市
2. **种子用户**：50-100 个宠主/帮养人够转起来，核心是密度不是数量
3. **AI 作为拉新钩子**：「AI 宠物医生免费问」→ 扫码 → 发现还能互助遛狗 → 留存
4. **社区化运营**：遛狗日记、同小区宠友、遛狗路线分享 → 用户留下来是因为这里有同类人

**信任冷启动：** 前 50 个帮养人手动审核认证，确保初期评价质量。冷启动阶段信誉比规模重要。

## Architecture

```
uni-app Client ──HTTPS/WSS──▶ Nginx ──▶ NestJS API
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              MySQL 8               Redis 7              LLM Provider
         (主库+空间索引+        (缓存/Pub-Sub/         (DeepSeek/通义千问
         全文索引)              限流/会话)             → AI健康助手)
```

## Database Schema

### 原有核心表 (7张)

1. **users** — 微信登录 + 角色切换 + 地理位置 + 信用分数字段
2. **pets** — 宠物档案（品种/性格/健康/遛狗偏好）
3. **walking_requests** — 遛狗请求状态机 (open→matched→in_progress→completed/cancelled)
4. **matches** — 匹配记录 + GPS追踪字段
5. **chat_messages** — 聊天消息 (text/image/location/system)
6. **knowledge_categories** — 知识库分类树
7. **knowledge_articles** — 文章（ngram全文索引）+ view_count

### 新增表 (8张) — 竞争力功能

#### Feature A: GPS追踪

```
walk_trails        — 每次遛狗完成后汇总轨迹
  id, match_id FK, coordinates JSON [{lat,lng,timestamp}],
  total_distance_m, total_duration_s, started_at, ended_at

walk_locations     — 实时GPS点位（遛狗中残留，24h后清理）
  id, match_id FK, lat, lng, timestamp
```

#### Feature B: 信任体系

```
badge_definitions   — 徽章定义（种子数据，规则引擎驱动）
  badge_key PK, name, icon, description,
  rule JSON {"type":"walks_count","operator":"gte","value":50},
  category, sort_order

user_badges         — 用户-徽章多对多
  id, user_id FK, badge_key FK, awarded_at

user_certifications — 帮养人经验认证
  id, user_id FK, cert_type, species_experience JSON,
  years, self_description, proof_photos JSON,
  status (pending/approved/rejected), verified_at

user_deposits       — 押金托管（微信支付占位）
  id, user_id FK, amount_cents, status (held/released/refunded),
  match_id FK?, transaction_id
```

#### Feature C: AI健康助手

```
ai_consultations   — 症状咨询记录（支持追问线程）
  id, user_id FK, pet_id FK?, consultation_type (symptom/follow_up),
  parent_id FK? (自引用), query_text, response JSON,
  related_article_ids JSON, urgency_level, tokens_used,
  query_hash (SHA256), created_at

ai_daily_usage     — 每日用量计数
  id, user_id FK, query_date, count
  UNIQUE(user_id, query_date)
```

### 现有表修改

**users 新增字段：**
credit_score(0-100), completion_count, cancellation_count, completion_rate, avg_response_time_s, is_helper, has_deposit

**review_ratings 新增字段：**
tags JSON (["准时","细心","狗狗很开心"]), from_role ENUM('owner','helper')

**matches 新增字段：**
status 扩展 +disputed, started_at, ended_at, track_distance_m, track_duration_s, sync_interval_s

---

## REST API Endpoints

所有接口前缀 `/api/v1`，响应格式 `{ success, data?, error?, meta? }`

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /auth/login | No |
| POST | /auth/refresh | Yes |
| POST | /auth/logout | Yes |

### Users & Pets
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/PATCH | /users/me | Yes |
| PATCH | /users/me/location | Yes |
| PATCH | /users/me/role | Yes |
| GET | /users/:id | Yes |
| CRUD | /pets | Yes |

### Walking & Match
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | /walking/requests | Yes |
| GET | /walking/requests/nearby?lat&lng&radius | Yes |
| GET/PATCH/DELETE | /walking/requests/:id | Yes |
| POST | /walking/requests/:id/apply | Yes |
| POST | /walking/matches/:id/accept\|reject\|start\|complete\|cancel | Yes |

### GPS Tracking (新增)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /walks/trails/:matchId | Yes |
| POST | /walks/locations | Yes (WebSocket断开备选) |
| GET | /walks/locations/:matchId/latest | Yes (轮询备选) |
| GET | /walks/:matchId/active | Yes |

### Chat
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /chat/conversations | Yes |
| GET | /chat/matches/:matchId/messages | Yes |
| POST | /chat/matches/:matchId/messages | Yes |
| PATCH | /chat/messages/:id/read | Yes |

### Knowledge
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /knowledge/categories | No |
| GET | /knowledge/articles | No |
| GET | /knowledge/articles/:id | No |
| GET | /knowledge/search?keyword | No |
| POST | /knowledge/articles/:id/like | Yes |

### Trust & Credit (新增)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST/GET | /trust/certifications | Yes |
| PUT | /trust/certifications/:id | Yes |
| GET | /trust/badges | Yes |
| GET | /trust/badges/user/:userId | Public |
| GET | /trust/credit-score/:userId | Public |
| POST/GET | /trust/deposits | Yes |

### AI Health (新增)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /ai-health/consult | Yes (限流10次/天) |
| POST | /ai-health/consult/:id/follow-up | Yes |
| GET | /ai-health/consultations | Yes |
| GET | /ai-health/consultations/:id | Yes |
| GET | /ai-health/daily-usage | Yes |

---

## WebSocket Events

### Chat Gateway (chat:*)
```
Client→Server:  chat:join, chat:leave, chat:message, chat:read, chat:typing
Server→Client:  chat:message, chat:read, chat:typing
```

### Walking Gateway (walking:* + match:*)
```
Client→Server:  walking:start_tracking, walking:location_update, walking:stop_tracking
Server→Client:  walking:tracking_started, walking:location_broadcast,
                walking:trail_sync (每60s或重连), walking:tracking_stopped
Server→Client:  match:new_application, match:accepted, match:rejected,
                match:started, match:completed
```

### GPS 断线备选
```
WebSocket断开 → Helper用 POST /walks/locations (每15s)
              → Owner 用 GET /walks/locations/:matchId/latest (每15s)
WebSocket重连 → Server 推送 walking:trail_sync (最近5分钟点位)
```

---

## AI Health RAG Pipeline

```
User query ("金毛拉肚子两天精神不好")
  → SHA256 hash → Redis cache 查 (TTL 24h)
  → 未命中 → MySQL FULLTEXT 搜索 knowledge_articles (取top 5)
  → 构建 prompt: system_prompt + articles context + user query
  → DeepSeek/通义千问 API 调用
  → 结构化响应:
     { possible_conditions, urgency_level, home_care[], when_to_see_vet,
       related_articles[], disclaimer }
  → 写 Redis cache + DB consultation 记录 + 增量 daily_usage
  → 返回给用户
```

## Credit Score Formula

```
score = (rating_avg/5 * 50) + (completion_rate * 30) + (min(exp_years,10)/10 * 20)
范围: 0-100

徽章自动授予（规则引擎）:
  - completion_count >= 50  → "资深铲屎官"
  - completion_count >= 100 → "金牌帮养人"
  - has_badge("medical_cert") → "医疗护理认证"
  - certifications 包含大型犬 → "大型犬专家"
  - consultations >= 10     → "AI健康达人"
  - completion_rate >= 0.95 AND completion_count >= 20 → "靠谱之星"
```

---

## Project Structure

```
d:/workspace/pethelp/
├── pethelp-client/                 # uni-app 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index/             # 首页
│   │   │   ├── walking/           # 遛狗市场、发布、详情、进行中(gps)、完成回放
│   │   │   ├── chat/              # 会话列表、聊天室
│   │   │   ├── profile/           # 个人中心、宠物管理、我的遛狗
│   │   │   ├── knowledge/         # 知识库分类、文章列表、详情
│   │   │   ├── trust/             # 认证申请、认证状态、信用展示、徽章墙、押金
│   │   │   ├── ai-health/         # AI问诊、历史记录
│   │   │   └── user/              # 公开资料页
│   │   ├── components/            # common, pet, walking, chat, knowledge, trust, ai-health, map
│   │   ├── composables/           # useAuth, useLocation, useChat, useWalkingTracker, useTrailReplay,
│   │   │                          # useCertification, useBadges, useCreditScore, useDeposit,
│   │   │                          # useAIHealth, usePagination, useDebounce
│   │   ├── stores/                # user, walking, chat, knowledge, trust, ai-health
│   │   ├── api/                   # HTTP 请求层（按模块拆分）
│   │   ├── socket/                # WebSocket 客户端 + 事件常量
│   │   ├── types/                 # TS 类型定义
│   │   └── utils/                 # format, validators(zod), geo(haversine), token, constants
│   └── pages.json
│
├── pethelp-server/                 # NestJS 后端
│   ├── src/
│   │   ├── common/                # decorators, guards, interceptors, filters, pipes, dto
│   │   ├── modules/
│   │   │   ├── auth/              # 微信登录 → JWT
│   │   │   ├── users/             # 用户CRUD + 角色切换 + 信用分数字段
│   │   │   ├── pets/              # 宠物CRUD
│   │   │   ├── walking/           # 遛狗请求 + 匹配 + GPS轨迹 + WalkingGateway
│   │   │   ├── chat/              # 聊天REST + ChatGateway (Socket.IO)
│   │   │   ├── knowledge/         # 知识库分类+文章+全文搜索
│   │   │   ├── reviews/           # 评价+标签
│   │   │   ├── trust/             # 认证+徽章+信用分+押金
│   │   │   └── ai-health/         # AI问诊RAG+限流+缓存
│   │   ├── redis/                 # Redis服务 + 会话 + PubSub
│   │   ├── websocket/             # WS认证守卫 + Socket.IO适配器
│   │   ├── shared/                # geo-utils (haversine), hash-utils (SHA256)
│   │   └── config/                # 数据库、Redis、微信、JWT、LLM配置
│   ├── seed/                      # 知识库种子 + 徽章定义种子
│   └── docker-compose.yml
│
└── docs/
    └── api.md
```

---

## 5-Stage Implementation Plan (10 weeks)

核心逻辑：**先让用户遛起来（核心闭环）→ 叠差异化（GPS+聊天）→ AI拉新 → 信任深化收尾。**

```
Phase 0 → 骨架跑通
Phase 1 → 核心闭环: 发布→匹配→认证→评价 （能遛了！）
Phase 2 → GPS实时追踪 （差异化武器）
Phase 3 → 即时聊天   （体验闭环）
Phase 4 → AI健康助手  （拉新噱头）
Phase 5 → 信任深化+知识库+收尾
```

---

### Phase 0: Foundation (Week 1)

**目标：** 开发环境跑通，登录可用，DB就绪，基础设施齐。

- 项目脚手架（uni-app + NestJS + Docker Compose）
- 所有 DB migration（15张表）
- 公共设施：守卫/拦截器/过滤器/管道/验证
- Auth 模块：wx.login → code2Session → JWT 签发
- 首页骨架（Tab bar + 四个tab占位）
- 请求拦截器（token注入 + 错误统一转换）+ Pinia setup
- Tencent Maps composable + geo-utils（haversine, bounding box）
- LLM provider 接口封装（预留，Phase 4用）
- 种子数据：12条徽章定义 + 知识库分类+文章

**交付物：** `docker compose up` → 后端可访问 → 小程序可登录 → 首页可见

---

### Phase 2: 核心闭环 — 遛狗匹配 + 基础认证 + 评价 (Week 2-3)

**为什么这个排第一：** 没有匹配流程一切都是空的。信任认证跟匹配一起上——用户看到帮养人的认证状态和评分，才敢把狗交出去。

**Backend:**
- Pet 模块：CRUD（品种/性格/健康档案/遛狗偏好）
- Walking Request 模块：创建 + 分页列表 + 附近查询（bounding box）+ 状态管理
- Match 模块：申请→接受→拒绝→开始→完成→取消，完整状态机
- Match Gateway：match:new_application, match:accepted, match:rejected（WebSocket）
- Certification 基础版：申请表单 + 状态查询 + 审批（user_certifications）
- Review 模块：评价CRUD + tags标签 + 双向互评
- Credit Score 基础版：walk完成后计算 + 更新 users.credit_score
- 角色切换接口

**Frontend:**
- 宠物管理页（列表/添加/编辑）+ PetCard, PetAvatar, PetSelector
- 遛狗发布页（时间选择 + 腾讯地图地点选择 + 宠物选择）
- 遛狗市场页（请求卡片列表 + 附近筛选 + 地图模式切换）
- 请求详情页（申请人列表 + 接受/拒绝操作）
- 认证申请页（多步表单：品种经验→年限→照片→提交）
- 评价页（星级评分 + 标签选择 + 文字评论）
- 角色切换按钮（首页/我的页可见）
- useWalking, useLocation, useCertification composables
- walking + trust Pinia stores

**交付物：** 宠主发布遛狗请求 → 帮养人浏览申请 → 宠主看认证+评分接受 → 遛狗完成 → 双向评价 → 信用分更新。**核心闭环走通。**

---

### Phase 3: GPS 实时遛狗追踪 (Week 4-5)

**为什么紧接着做：** 核心闭环能遛了，立刻叠上最硬核的差异化功能。遛狗中的实时追踪是宠主最大的安全感来源。

**Backend:**
- Walking Gateway 扩展：walking:start_tracking, location_update, stop_tracking
- Walking Service：recordLocation, finalizeTrail, getTrail, calculateDistance（haversine）
- walk_trails + walk_locations 实体 + REST 端点
- location.processor：批量写入缓冲（30s flush）
- WebSocket 断开备选：REST POST /walks/locations（每15s）+ GET polling（每15s）
- walk_locations 24h 自动清理 cron job
- Match 表扩展：started_at, ended_at, track_distance_m, track_duration_s

**Frontend:**
- walking-active.vue：全屏腾讯地图 + 实时轨迹绘制 + 计时器 + 距离 + 结束按钮
- walking-complete.vue：遛狗总结卡片 + 轨迹回放（播放/暂停/拖动）
- WalkTimer, WalkDistance, WalkTrailMap, WalkReplay, WalkStatusBar 组件
- useWalkingTracker composable：startTracking, stopTracking, onLocationUpdate, fallbackToREST
- useTrailReplay composable：play, pause, seek, speed
- walking Pinia store 扩展：位置流缓冲 + 轨迹状态
- manifest.json：wx.startLocationUpdateBackground 后台定位权限

**交付物：** 帮养人点"开始遛狗"→ 手机每5秒上传GPS → 宠主在地图上实时看位置+轨迹 → 点"结束"→ 轨迹存档可回放。WebSocket断开自动切REST备选。

---

### Phase 4: 即时聊天 (Week 6-7)

**为什么现在做：** 匹配了、能遛了、能追踪了——但宠主和帮养人之间还需要沟通细节（"到了吗""狗狗在哪个门"）。聊天补上体验最后一块拼图。

**Backend:**
- Chat Gateway：Socket.IO 房间管理 + 消息广播 + 历史查询
- 消息持久化到 chat_messages 表
- Redis Adapter：多实例 WebSocket 跨进程同步
- Chat REST：会话列表（按match聚合，最后消息+未读数）、历史消息（分页）、标记已读
- 未读计数维护

**Frontend:**
- Socket.IO 客户端（Mini Program 适配：socket.io-wxapp-transport）
- 会话列表页：按match聚合 + 最后消息预览 + 未读红点
- 聊天室页：ChatBubble（文字/图片/位置/系统消息）+ ChatInput（文本+图片+位置）+ 日期分隔线
- 已读回执（双蓝勾）+ 输入中提示 + Tab bar 未读角标
- useChat composable：connect, sendMessage, onMessage, markRead
- chat Pinia store

**交付物：** 匹配成功的宠主和帮养人能实时聊天。消息类型支持文字、图片、位置分享、系统通知。

---

### Phase 5: AI健康助手 + 信任深化 + 知识库 + 收尾 (Week 8-10)

**为什么最后做：** AI是拉新噱头不是留存核心，信任徽章需要真实数据积累才有意义，知识库是内容填充。三件事并行收尾。

**Week 8 — AI健康助手：**
- ai-health 模块：controller + service + RAG pipeline
- ai-rag.service：keyword search knowledge_articles(top5) → build prompt → DeepSeek/通义千问
- ai-limiter.service：Redis INCR + DB 审计，10次/天/人
- ai-cache.service：SHA256(query) → Redis 24h TTL
- 结构化响应：possible_conditions[] + urgency_level + home_care[] + when_to_see_vet + disclaimer
- 追问线程：consultation parent_id 自引用
- 前端：consult.vue（聊天气泡式问诊）+ history.vue + useAIHealth composable

**Week 9 — 信任体系深化：**
- badge.service：规则引擎自动评估/授予徽章（walks_count, completion_rate, cert_type, consultations）
- 徽章墙 + CreditScoreRing + 信用展示页
- 押金接口（微信支付占位）
- 反作弊：同IP评分检测 + 异常评价标记

**Week 10 — 知识库 + 集成收尾：**
- Knowledge 模块：分类树 + 文章分页 + ngram全文搜索 + 热门排序
- 文章阅读计数（Redis INCR → 5min批量写DB）
- 种子数据填充：30+品种百科 + 20+疾病防治 + 20+用药指南 + 20+养护技巧
- 前端：分类页 + 文章列表 + 详情（mp-html富文本）+ 搜索
- 全流程联调：登录→认证→发请求→匹配→GPS追踪→聊天→完成→评价→徽章→AI问诊→知识库
- Jest 单元测试（auth/walking/chat/trust/ai-health service）
- 微信开发者工具真机调试

**交付物：** 完整 MVP 可上线。用户可以走通全部流程。

---

## Key Design Decisions

1. **GPS tracking only active during walk**: privacy by design，`is_tracking=true` 仅在 status=in_progress 期间
2. **Credit score materialized**: 直接存 users.credit_score，列表页无需实时计算，walk完成后异步更新
3. **Badge rules data-driven**: 规则存 JSON in badge_definitions，新增徽章只需 seed 数据，不用改代码
4. **AI cache SHA256 normalize**: 同义查询（"拉肚子"≈"腹泻"）不去重，但完全相同的 query hash 命中 Redis 缓存
5. **Walk_locations 24h retention**: 遛狗中实时写入，完成后聚合到 walk_trails，原始点位定时清理
6. **LLM provider abstraction**: interface LLMProvider，通过环境变量切换 DeepSeek/通义千问/Claude
7. **WebSocket fallback**: 小程序 WebSocket 不够稳定，备选 REST polling 确保轨迹不丢

## Verification

1. **Docker Compose** 一键启动 MySQL + Redis + NestJS
2. **微信开发者工具** 导入 uni-app 编译产物，完整走通主流程
3. **GPS 追踪**：模拟遛狗路线，验证实时推送 + 轨迹回放 + 断网恢复
4. **AI 问诊**：5个典型症状查询，验证响应质量 + 限流 + 缓存
5. **信用体系**：完成5次遛狗 + 评价 → 验证 score 自动更新 + 徽章自动授予
6. **Jest** 单元测试覆盖 auth/walking/chat/trust/ai-health service
7. **知识库搜索** 验证 ngram 中文分词准确度
