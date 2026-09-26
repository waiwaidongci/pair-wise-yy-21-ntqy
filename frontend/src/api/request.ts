/** 统一请求封装：前端只访问 /api，禁止硬编码 localhost */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...init
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((body as { message?: string }).message ?? `请求失败(${res.status})`);
    (err as Error & { code?: string }).code = (body as { code?: string }).code;
    throw err;
  }
  return body as T;
}
