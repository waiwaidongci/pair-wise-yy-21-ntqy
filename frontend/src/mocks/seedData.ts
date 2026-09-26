// 离线兜底数据，与后端 seed 结构保持一致（时间戳为静态快照）
export const mockData = {
  "gridAsset": [
    { "id": 1, "asset_code": "TR-10KV-001", "asset_type": "TRANSFORMER", "feeder_line": "城东一线", "voltage_level": "LOW", "location_desc": "城东配电房1号变", "health_status": "NORMAL", "owner_team_id": 1 },
    { "id": 2, "asset_code": "TR-10KV-002", "asset_type": "TRANSFORMER", "feeder_line": "城西二线", "voltage_level": "LOW", "location_desc": "城西箱变2号", "health_status": "WATCH", "owner_team_id": 2 },
    { "id": 3, "asset_code": "LN-10KV-003", "asset_type": "LINE", "feeder_line": "城北三线", "voltage_level": "MEDIUM", "location_desc": "城北主干线12号杆", "health_status": "DANGEROUS", "owner_team_id": 3 },
    { "id": 4, "asset_code": "SW-10KV-004", "asset_type": "SWITCH", "feeder_line": "城南四线", "voltage_level": "MEDIUM", "location_desc": "城南环网柜4号", "health_status": "NORMAL", "owner_team_id": 4 }
  ],
  "faultReport": [
    { "id": 1, "reporter_name": "王建国", "phone": "13800000001", "asset_id": 1, "fault_type": "OUTAGE", "address_desc": "城东街道整片停电", "severity": "URGENT", "report_channel": "95598热线", "status": "PENDING" },
    { "id": 2, "reporter_name": "李秀兰", "phone": "13800000002", "asset_id": 3, "fault_type": "TRIP", "address_desc": "城北三线频繁跳闸", "severity": "MAJOR", "report_channel": "营业厅", "status": "PENDING" },
    { "id": 3, "reporter_name": "张卫国", "phone": "13800000003", "asset_id": 2, "fault_type": "VOLTAGE_LOW", "address_desc": "城西小区电压偏低", "severity": "NORMAL", "report_channel": "网上国网", "status": "PENDING" },
    { "id": 4, "reporter_name": "陈丽华", "phone": "13800000004", "asset_id": 4, "fault_type": "SAFETY_RISK", "address_desc": "城南环网柜异响冒烟", "severity": "URGENT", "report_channel": "95598热线", "status": "PENDING" },
    { "id": 5, "reporter_name": "刘志强", "phone": "13800000005", "asset_id": 1, "fault_type": "OUTAGE", "address_desc": "城东二巷台区失电", "severity": "MAJOR", "report_channel": "网格群", "status": "DISPATCHED" },
    { "id": 6, "reporter_name": "赵敏", "phone": "13800000006", "asset_id": 3, "fault_type": "TRIP", "address_desc": "城北支线开关跳闸", "severity": "URGENT", "report_channel": "95598热线", "status": "DISPATCHED" },
    { "id": 7, "reporter_name": "孙浩然", "phone": "13800000007", "asset_id": 2, "fault_type": "EQUIPMENT_DAMAGE", "address_desc": "城西箱变烧毁", "severity": "MAJOR", "report_channel": "营业厅", "status": "RESTORED" },
    { "id": 8, "reporter_name": "周文", "phone": "13800000008", "asset_id": 4, "fault_type": "EQUIPMENT_DAMAGE", "address_desc": "城南环网柜绝缘击穿", "severity": "MAJOR", "report_channel": "网上国网", "status": "PENDING" }
  ],
  "repairTicket": [
    { "id": 1, "fault_report_id": 1, "team_id": 0, "dispatcher_id": 1, "priority": "MEDIUM", "status": "WAIT_DISPATCH", "created_at": "2026-09-26T08:00:00Z", "assigned_at": "", "restored_at": "" },
    { "id": 2, "fault_report_id": 2, "team_id": 0, "dispatcher_id": 1, "priority": "MEDIUM", "status": "WAIT_DISPATCH", "created_at": "2026-09-26T08:25:00Z", "assigned_at": "", "restored_at": "" },
    { "id": 3, "fault_report_id": 3, "team_id": 0, "dispatcher_id": 1, "priority": "LOW", "status": "WAIT_DISPATCH", "created_at": "2026-09-26T08:07:00Z", "assigned_at": "", "restored_at": "" },
    { "id": 4, "fault_report_id": 4, "team_id": 0, "dispatcher_id": 1, "priority": "MEDIUM", "status": "WAIT_DISPATCH", "created_at": "2026-09-26T08:42:00Z", "assigned_at": "", "restored_at": "" },
    { "id": 5, "fault_report_id": 5, "team_id": 1, "dispatcher_id": 1, "priority": "HIGH", "status": "ASSIGNED", "created_at": "2026-09-26T08:17:00Z", "assigned_at": "2026-09-26T08:29:00Z", "restored_at": "" },
    { "id": 6, "fault_report_id": 6, "team_id": 2, "dispatcher_id": 1, "priority": "HIGH", "status": "ARRIVED", "created_at": "2026-09-26T07:17:00Z", "assigned_at": "2026-09-26T07:27:00Z", "restored_at": "" },
    { "id": 7, "fault_report_id": 7, "team_id": 4, "dispatcher_id": 1, "priority": "HIGH", "status": "RESTORED", "created_at": "2026-09-25T22:47:00Z", "assigned_at": "2026-09-25T23:07:00Z", "restored_at": "2026-09-26T03:47:00Z" },
    { "id": 8, "fault_report_id": 8, "team_id": 0, "dispatcher_id": 1, "priority": "LOW", "status": "WAIT_DISPATCH", "created_at": "2026-09-26T07:42:00Z", "assigned_at": "", "restored_at": "" }
  ],
  "crew": [
    { "id": 1, "name": "城东抢修一班", "leader_id": 1, "skill_tags": "OUTAGE,TRIP", "duty_status": "ON_DUTY", "current_ticket_id": 5, "contact_phone": "13900000001" },
    { "id": 2, "name": "城西抢修二班", "leader_id": 2, "skill_tags": "OUTAGE,EQUIPMENT_DAMAGE", "duty_status": "ON_DUTY", "current_ticket_id": 6, "contact_phone": "13900000002" },
    { "id": 3, "name": "城北抢修三班", "leader_id": 3, "skill_tags": "TRIP,VOLTAGE_LOW,SAFETY_RISK", "duty_status": "OFF_DUTY", "current_ticket_id": 0, "contact_phone": "13900000003" },
    { "id": 4, "name": "城南抢修四班", "leader_id": 4, "skill_tags": "TRIP,OUTAGE", "duty_status": "ON_DUTY", "current_ticket_id": 0, "contact_phone": "13900000004" },
    { "id": 5, "name": "电缆专修五班", "leader_id": 5, "skill_tags": "EQUIPMENT_DAMAGE,SAFETY_RISK", "duty_status": "ON_DUTY", "current_ticket_id": 0, "contact_phone": "13900000005" }
  ],
  "sparePartUsage": [
    { "id": 1, "ticket_id": 5, "part_code": "TR-400KVA", "part_name": "配电变压器", "quantity": 1, "warehouse_name": "城东中心库", "approved_by": "仓管员甲", "usage_status": "APPLIED" },
    { "id": 2, "ticket_id": 6, "part_code": "CB-10KV", "part_name": "柱上断路器", "quantity": 2, "warehouse_name": "城北周转库", "approved_by": "仓管员乙", "usage_status": "APPROVED" },
    { "id": 3, "ticket_id": 7, "part_code": "CT-10KV", "part_name": "电流互感器", "quantity": 3, "warehouse_name": "城东中心库", "approved_by": "仓管员甲", "usage_status": "CONSUMED" }
  ]
} as const;
