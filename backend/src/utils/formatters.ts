export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

/** 两个时间之间的整分钟数（b 默认当前时刻） */
export const minutesBetween = (a: string, b: Date = new Date()) =>
  Math.floor((b.getTime() - new Date(a).getTime()) / 60_000);

/** 解析班组技能标签 JSON 字符串 */
export const parseSkillTags = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};
