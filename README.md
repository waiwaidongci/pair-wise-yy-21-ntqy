# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `DATA_FILE`: 后端本地持久化文件路径，默认 `./data/store.json`
- `ESCALATION_TIMEOUT_MINUTES`: 超时催办阈值（分钟），默认 `15`
- `DISPATCH_SCAN_INTERVAL_MS`: 超时扫描周期（毫秒），默认 `60000`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- Severity / Priority / DutyStatus / UrgeStatus: 前后端 `constants/` 同名模块、`constants/dispatchRules.ts`（后端）、`constants/dispatchText.ts`（前端）、调度台页面与 DispatchService 均有引用。

## 调度台与超时催办

调度台页面（`/dispatch`）是值班员的派工工作台，核心是超时催办闭环：

- **超时升级**：故障报修严重度为重大（MAJOR）或紧急（URGENT）的工单，处于待派工（WAIT_DISPATCH）超过 15 分钟（`ESCALATION_TIMEOUT_MINUTES`）时，扫描器自动将工单优先级升级为 HIGH，并生成一条催办待办（DispatchUrge，状态 OPEN）。
- **待办关闭**：工单派给“技能匹配故障类型、非离岗、无未结工单”的班组后，对应待办以 `DISPATCHED` 原因关闭；工单被推进到已到场/复电等状态时，遗留待办以 `STATUS_ADVANCED` 关闭。已到场或已复电工单不会再生成待办。
- **去重与再生**：重复扫描对同一工单只保留一条 OPEN 待办（仅刷新扫描时间与次数）；待办关闭后若工单再次超时（例如撤销派工回到待派工），下一次扫描会重新生成新待办。
- **持久化**：工单、班组与催办待办写入后端本地 JSON 文件（`DATA_FILE`，默认 `backend/data/store.json`），进程重启后待办与升级状态仍可查询。
- **页面展示**：待派工列表实时显示已等待时长、超时时长与催办状态（催办中/未超时/普通工单），每 30 秒自动刷新，也可手动“立即扫描”。

调度接口（统一挂在 `/api/dispatch`）：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/dispatch/overview` | 待派工、进行中工单与 OPEN 待办总览（读取前自动扫描一次） |
| GET | `/api/dispatch/urges` | 全部催办待办（含历史已解除记录） |
| POST | `/api/dispatch/scan` | 手动触发一次超时扫描 |
| GET | `/api/dispatch/eligible-crews?ticket_id=` | 各班组的技能/在岗/未结工单校验结果 |
| POST | `/api/dispatch/dispatch` | 派工 `{ ticket_id, team_id }`，校验失败返回对应错误码 |
| POST | `/api/dispatch/revoke` | 撤销派工 `{ ticket_id }`，工单回到待派工 |

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
