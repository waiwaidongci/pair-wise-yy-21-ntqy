# 电力配网抢修工单系统（grid-repair）

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。核心页面为**抢修调度台**：自动扫描待派工工单，对重大/紧急报修超时未派工自动升级优先级并生成催办待办，值班员可直接在页面派工、到场确认、复电闭环。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后打开前端 **<http://localhost:20104>**，默认进入「调度台」页面；后端健康检查：<http://localhost:21104/health>。

### 超时催办规则

- 报修等级为**重大（MAJOR）/ 紧急（URGENT）**且工单处于待派工（WAIT_DISPATCH）。
- 报修登记起超过 **15 分钟**未派工（`URGE_TIMEOUT_MINUTES` 可配），后端定时扫描（默认每 30 秒）将工单**优先级升为 HIGH**，并生成一条状态为 OPEN 的**催办待办**。
- 已派工 / 已到场 / 已复电的工单不再生成催办；一般（NORMAL）报修不参与升级。
- 重复扫描同一工单只保留一条 OPEN 待办；值班员手动解除后，若工单仍未派工且再次超时，扫描会重新生成新待办。
- 派工时只允许选择**技能匹配**（故障类型 → 技能标签）、**非离岗**（非 OFF_DUTY）且**无未结工单**（current_ticket_id 为空）的班组；派工成功后工单转 ASSIGNED，催办待办自动关闭（原因「已派工」），复电后班组释放。
- 数据持久化在后端命名卷 `backend_data` 的 JSON 数据文件中，容器/进程重启后工单、催办待办仍可查询。

## 访问地址或 CLI 示例

- 前端（调度台）：<http://localhost:20104/#/dispatch>
- 后端健康检查：<http://localhost:21104/health>
- 调度看板：`GET http://localhost:21104/api/repair-ticket/board`
- 催办待办：`GET http://localhost:21104/api/urge-todo?status=OPEN`
- 立即扫描：`POST http://localhost:21104/api/urge-todo/scan`
- 派工：`POST http://localhost:21104/api/repair-ticket/{id}/assign`，body：`{"crew_id":1}`
- 解除催办：`POST http://localhost:21104/api/urge-todo/{id}/close`，body：`{"reason":"已电话催办"}`

## 本地开发方式

- 后端：`cd backend && npm install && npm run dev`（默认 3000 端口，数据文件 `backend/data/grid-repair.json`，删除该文件可重置种子数据）
- 前端：`cd frontend && npm install && npm run dev`（20104 端口，Vite 已配置 `/api` 代理到 `http://localhost:3000`，可用 `VITE_API_TARGET` 覆盖）
- 前端请求统一走 `/api`，禁止硬编码 `localhost`。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia |
| 后端 | Node.js + Express + TypeScript（分层：routes / controllers / services / repositories / models） |
| 持久化 | MySQL 8.0（Docker）＋本地 JSON 文件存储（保证轻量运行与重启可查询） |
| 部署 | Docker Compose（frontend / backend / db） |

## 项目目录结构

```text
frontend/src/
├── api/                 # request 封装 + 按实体拆分（RepairTicket / UrgeTodo / Crew …）
├── stores/              # DispatchConsoleStore 等 Pinia store
├── types/               # RepairTicket / FaultReport / Crew / UrgeTodo / DispatchBoard
├── constants/           # 枚举与文案、urgeRules（超时阈值/技能匹配）
├── constructors/        # 默认对象/表单构造器
├── components/common/   # StatusBadge / PriorityTag / CrewCard / StatCard / TimelineList …
├── components/dispatch/ # DispatchTicketTable / UrgeTodoPanel / AssignCrewDialog
├── hooks/               # useTicketFlow / useCrewAvailability / usePagination
├── pages/DispatchPage.vue
└── router/, utils/, mocks/
backend/src/
├── data/store.ts        # 文件持久化（首次启动灌入 seed，写后落盘）
├── routes/, controllers/, services/
├── models/, repositories/
├── middlewares/, constants/, constructors/, utils/, types/, config/
└── seed.ts              # 紧急超时 / 重大临界 / 一般超时 / 已派工 四种样例工单
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`：Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`：前端端口，默认 `20104`
- `BACKEND_PORT`：后端宿主机端口，默认 `21104`（容器内 3000）
- `DB_PORT`：数据库宿主机端口，默认 `33060`
- `DB_USER/DB_PASSWORD/DB_NAME`：数据库凭据
- `URGE_TIMEOUT_MINUTES`：催办阈值分钟数，默认 `15`
- `SCAN_INTERVAL_MS`：后端扫描间隔毫秒，默认 `30000`
- `DATA_FILE`：后端持久化数据文件路径，容器内默认 `/app/data/grid-repair.json`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库命名卷 `db_data`；后端业务数据命名卷 `backend_data`（挂载到 `/app/data`），均不绑定中文路径。
- db 配置 healthcheck，backend 通过 `depends_on: condition: service_healthy` 等待数据库；backend 提供 `/health`，frontend 依赖 backend 健康。
- 常见问题：端口占用时改 `.env` 端口后重启；重置演示数据执行 `docker compose down -v`（会同时清除两个命名卷）。

## 枚举/常量出现位置清单

### FaultType（OUTAGE / VOLTAGE_LOW / TRIP / EQUIPMENT_DAMAGE / SAFETY_RISK）

- 后端：`backend/src/constants/FaultType.ts`（枚举）、`constants/urgeRules.ts`（FAULT_SKILL_MAP 技能匹配）、`services/RepairTicketService.ts`（派工校验）、`seed.ts`（种子数据）。
- 前端：`frontend/src/constants/FaultType.ts`（枚举+中文文案）、`constants/urgeRules.ts`、`components/dispatch/DispatchTicketTable.vue`（FaultTypeText 展示）。

### TicketStatus（WAIT_DISPATCH / ASSIGNED / ARRIVED / REPAIRING / RESTORED / CLOSED）

- 后端：`backend/src/constants/TicketStatus.ts`、`services/RepairTicketService.ts`（scanOverdue/assign/arrive/restore 流转）、`models/RepairTicket.ts`、`constructors/RepairTicketDtoFactory.ts`、`seed.ts`、`database/init.sql`。
- 前端：`frontend/src/constants/TicketStatus.ts`（中文文案）、`types/RepairTicket.ts`、`constructors/RepairTicketConstructor.ts`、`hooks/useTicketFlow.ts`（动作可用性）、`components/common/StatusBadge.vue`、`components/dispatch/DispatchTicketTable.vue`、`pages/DispatchPage.vue`。

### AssetHealthStatus（NORMAL / WATCH / DEGRADED / DANGEROUS）

- `backend/src/constants/AssetHealthStatus.ts`、`frontend/src/constants/AssetHealthStatus.ts`、资产种子数据与资产模块共享组件引用。

### 调度台新增枚举

- Severity（NORMAL/MAJOR/URGENT）：后端 `constants/Severity.ts`（urgeRules 引用）、模型/种子；前端 `constants/Severity.ts`、StatusBadge、UrgeTodoPanel、工单表格。
- TicketPriority（LOW/MEDIUM/HIGH）：后端 `constants/TicketPriority.ts`（升级到 HIGH）；前端 `constants/TicketPriority.ts`、PriorityTag。
- DutyStatus（ON_DUTY/OFF_DUTY/BUSY）：后端 `constants/DutyStatus.ts`（派工校验）；前端 `constants/DutyStatus.ts`、useCrewAvailability、CrewCard。
- UrgeTodoStatus（OPEN/CLOSED）：后端 `constants/UrgeTodoStatus.ts`、`models/UrgeTodo.ts`、`repositories/UrgeTodoRepository.ts`、`services/UrgeTodoService.ts`；前端 `constants/UrgeTodoStatus.ts`、`types/UrgeTodo.ts`、UrgeTodoPanel。

## 为什么会牵一发动全身

调度台一个「超时升级」动作横跨：扫描规则（constants/urgeRules）、工单状态枚举、优先级枚举、日志模板（RepairTicket.escalate / UrgeTodo.create|close|reopen|scan）、错误码与错误消息（技能不匹配/离岗/未结工单）、service/repository/controller/route 四层、DTO 构造器、文件持久化，以及前端的 types / api / store / hooks / 三个 dispatch 组件 / StatusBadge、PriorityTag 两个共享组件 / 格式化函数与中文文案。修改阈值或状态值需同步前后端多处常量与 README。

## License

MIT
