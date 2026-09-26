export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
// 时长格式化：超时时长、等待时长统一展示
export const formatDurationMinutes = (minutes: number) => {
  const total = Math.max(0, Math.floor(minutes));
  if (total < 60) return `${total}分钟`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours}小时` : `${hours}小时${rest}分钟`;
};
