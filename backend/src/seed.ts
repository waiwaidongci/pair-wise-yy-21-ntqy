/**
 * 种子数据：时间以当前时刻为基准偏移，保证首次启动就能看到
 * 超时升级 / 临界 / 正常 三种催办形态。
 */
const now = Date.now();
const min = (m: number) => new Date(now - m * 60_000).toISOString();

export const seed = {
  gridAsset: [
    {
      id: 1,
      asset_code: "T-10KV-CY1-012",
      asset_type: "配电变压器",
      feeder_line: "10kV 城一线",
      voltage_level: "10kV",
      location_desc: "城关街道 12# 杆",
      health_status: "NORMAL",
      owner_team_id: 1
    },
    {
      id: 2,
      asset_code: "S-10KV-GY2-003",
      asset_type: "柱上开关",
      feeder_line: "10kV 工二线",
      voltage_level: "10kV",
      location_desc: "工业园区 3# 开关",
      health_status: "WATCH",
      owner_team_id: 2
    },
    {
      id: 3,
      asset_code: "T-04KV-HX-007",
      asset_type: "台区配变",
      feeder_line: "0.4kV 河西台区",
      voltage_level: "0.4kV",
      location_desc: "河西村末端",
      health_status: "DEGRADED",
      owner_team_id: 4
    }
  ],
  sparePartUsage: [] as Array<Record<string, unknown>>,
  faultReport: [
    {
      id: 1,
      reporter_name: "王建国",
      phone: "13800000001",
      asset_id: 1,
      fault_type: "OUTAGE",
      address_desc: "城关街道 10kV 城一线 12# 杆",
      severity: "URGENT",
      report_channel: "95598",
      status: "OPEN",
      reported_at: min(47)
    },
    {
      id: 2,
      reporter_name: "李晓梅",
      phone: "13800000002",
      asset_id: 2,
      fault_type: "TRIP",
      address_desc: "工业园区 10kV 工二线 3# 开关",
      severity: "MAJOR",
      report_channel: "营业厅",
      status: "OPEN",
      reported_at: min(12)
    },
    {
      id: 3,
      reporter_name: "张伟",
      phone: "13800000003",
      asset_id: 3,
      fault_type: "VOLTAGE_LOW",
      address_desc: "河西村 0.4kV 台区末端",
      severity: "NORMAL",
      report_channel: "微信公众号",
      status: "OPEN",
      reported_at: min(35)
    },
    {
      id: 4,
      reporter_name: "刘志强",
      phone: "13800000004",
      asset_id: 1,
      fault_type: "EQUIPMENT_DAMAGE",
      address_desc: "城关街道 10kV 城一线 8# 变压器",
      severity: "MAJOR",
      report_channel: "95598",
      status: "DISPATCHED",
      reported_at: min(120)
    }
  ],
  repairTicket: [
    // 紧急 + 已超时 47 分钟：首次扫描即升级并生成催办待办
    {
      id: 1,
      fault_report_id: 1,
      team_id: null,
      dispatcher_id: null,
      priority: "MEDIUM",
      status: "WAIT_DISPATCH",
      reported_at: min(47),
      assigned_at: null,
      arrived_at: null,
      restored_at: null,
      escalated_at: null
    },
    // 重大 + 12 分钟：临界，页面倒计时
    {
      id: 2,
      fault_report_id: 2,
      team_id: null,
      dispatcher_id: null,
      priority: "MEDIUM",
      status: "WAIT_DISPATCH",
      reported_at: min(12),
      assigned_at: null,
      arrived_at: null,
      restored_at: null,
      escalated_at: null
    },
    // 一般 + 已超 15 分钟：不参与催办规则，保持原优先级
    {
      id: 3,
      fault_report_id: 3,
      team_id: null,
      dispatcher_id: null,
      priority: "LOW",
      status: "WAIT_DISPATCH",
      reported_at: min(35),
      assigned_at: null,
      arrived_at: null,
      restored_at: null,
      escalated_at: null
    },
    // 已派工到 2 班：不再催办
    {
      id: 4,
      fault_report_id: 4,
      team_id: 2,
      dispatcher_id: 1,
      priority: "HIGH",
      status: "ASSIGNED",
      reported_at: min(120),
      assigned_at: min(95),
      arrived_at: null,
      restored_at: null,
      escalated_at: null
    }
  ],
  crew: [
    {
      id: 1,
      name: "抢修一班",
      leader_id: 11,
      skill_tags: JSON.stringify(["线路抢修", "开关检修"]),
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000001"
    },
    {
      id: 2,
      name: "抢修二班",
      leader_id: 12,
      skill_tags: JSON.stringify(["设备更换", "电压治理"]),
      duty_status: "ON_DUTY",
      current_ticket_id: 4,
      contact_phone: "13900000002"
    },
    {
      id: 3,
      name: "抢修三班",
      leader_id: 13,
      skill_tags: JSON.stringify(["线路抢修", "带电作业"]),
      duty_status: "OFF_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000003"
    },
    {
      id: 4,
      name: "抢修四班",
      leader_id: 14,
      skill_tags: JSON.stringify(["电压治理", "设备更换"]),
      duty_status: "ON_DUTY",
      current_ticket_id: null,
      contact_phone: "13900000004"
    }
  ]
};
